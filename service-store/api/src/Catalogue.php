<?php
declare(strict_types=1);

/** The menu, its prices, and the only place a price is decided. */
final class Catalogue
{
    public const GST = 0.18;
    public const ROUNDS = 4;
    public const STAGES = ['Brief', 'Kick-off', 'In production', 'First cut', 'Corrections', 'Final delivery', 'Completed'];
    public const SPECIALS = ['logo', 'v30', 'social20', 'site'];

    private static ?array $services = null;

    public static function services(): array
    {
        if (self::$services !== null) {
            return self::$services;
        }
        $out = [];
        foreach (Db::all('SELECT s.* FROM services s JOIN categories c ON c.id = s.category_id WHERE s.active = 1 ORDER BY c.sort, s.sort') as $r) {
            $s = [
                'id' => $r['id'], 'cat' => $r['category_id'], 'name' => $r['name'], 'price' => (float) $r['price'], 'unit' => $r['unit'],
                'days' => (int) $r['days'], 'desc' => $r['description'], 'inc' => [],
            ];
            if ($r['tag']) {
                $s['tag'] = $r['tag'];
            }
            if ($r['qty_label']) {
                $s['qty'] = ['label' => $r['qty_label'], 'min' => (int) $r['qty_min']];
            }
            $out[$r['id']] = $s;
        }
        foreach (Db::all('SELECT service_id, label FROM service_includes ORDER BY sort') as $r) {
            if (isset($out[$r['service_id']])) {
                $out[$r['service_id']]['inc'][] = $r['label'];
            }
        }
        foreach (Db::all('SELECT id, service_id, label FROM option_groups ORDER BY service_id, sort') as $g) {
            if (!isset($out[$g['service_id']])) {
                continue;
            }
            $choices = array_map(fn ($c) => [$c['label'], (float) $c['price']], Db::all('SELECT label, price FROM option_choices WHERE group_id = ? ORDER BY sort', [$g['id']]));
            $out[$g['service_id']]['opts'][] = ['label' => $g['label'], 'choices' => $choices];
        }
        foreach (Db::all('SELECT service_id, label, price FROM service_extras ORDER BY sort') as $r) {
            if (isset($out[$r['service_id']])) {
                $out[$r['service_id']]['extras'][] = [$r['label'], (float) $r['price']];
            }
        }
        return self::$services = $out;
    }

    public static function addons(): array
    {
        $out = [];
        foreach (Db::all('SELECT * FROM addons ORDER BY sort') as $a) {
            $x = ['id' => $a['id'], 'name' => $a['name'], 'desc' => $a['description']];
            if ($a['flat'] !== null) {
                $x['flat'] = (float) $a['flat'];
            } else {
                $x['pct'] = (float) $a['pct'];
                $x['min'] = (float) $a['min_price'];
            }
            $out[$a['id']] = $x;
        }
        return $out;
    }

    public static function team(): array
    {
        return array_column(Db::all('SELECT name FROM team WHERE active = 1 ORDER BY sort'), 'name');
    }

    public static function isOneTime(array $s): bool
    {
        return in_array($s['unit'], ['project', 'unit', 'from'], true);
    }

    /** Everything the page needs to draw itself. */
    public static function page(): array
    {
        return [
            'cats' => Db::all('SELECT id, name, blurb FROM categories ORDER BY sort'),
            'services' => array_values(self::services()),
            'addons' => array_values(self::addons()),
            'team' => self::team(),
            'stages' => self::STAGES,
            'specials' => self::SPECIALS,
            'gst' => self::GST,
            'rounds' => self::ROUNDS,
            'payments' => Pay::mode(),
            'demo' => (bool) Config::get('demo', false),
        ];
    }

    /** Turns what the browser sent into a checked line with our own price. */
    public static function line(mixed $raw): array
    {
        $s = is_array($raw) ? (self::services()[$raw['sid'] ?? ''] ?? null) : null;
        if (!$s) {
            throw new Stop('One of the services in your cart is no longer on the menu. Please remove it and try again.');
        }
        $bad = fn () => throw new Stop("Please open {$s['name']} in your cart and check its options.");
        $int = fn ($v) => is_int($v) ? $v : $bad();

        $unit = $s['price'];
        $bits = [];
        $opts = [];
        foreach ($s['opts'] ?? [] as $i => $g) {
            $k = $int($raw['opts'][$i] ?? 0);
            $choice = $g['choices'][$k] ?? $bad();
            $unit += $choice[1];
            $bits[] = $choice[0];
            $opts[] = $k;
        }
        $extras = [];
        foreach (is_array($raw['extras'] ?? null) ? array_values(array_unique($raw['extras'], SORT_REGULAR)) : [] as $k) {
            $x = $s['extras'][$int($k)] ?? $bad();
            $unit += $x[1];
            $bits[] = $x[0];
            $extras[] = $k;
        }
        $qty = 1;
        if (isset($s['qty'])) {
            $qty = $int($raw['qty'] ?? 0);
            if ($qty < $s['qty']['min'] || $qty > 999) {
                $bad();
            }
            array_unshift($bits, $qty . ' ' . $s['qty']['label']);
        }
        $sub = $unit * $qty;
        $add = 0.0;
        $addons = [];
        if (self::isOneTime($s)) {
            foreach (is_array($raw['addons'] ?? null) ? array_unique($raw['addons'], SORT_REGULAR) : [] as $id) {
                $a = is_string($id) ? (self::addons()[$id] ?? $bad()) : $bad();
                $add += $a['flat'] ?? max($a['min'], $sub * $a['pct']);
                $bits[] = $a['name'];
                $addons[] = $id;
            }
        }
        return [
            'service' => $s, 'qty' => $qty, 'amount' => round($sub + $add, 2), 'detail' => implode(' · ', $bits),
            'config' => ['opts' => $opts, 'extras' => $extras, 'addons' => $addons], 'express' => in_array('express', $addons, true),
        ];
    }

    /** What one line costs with GST, and how much of it is paid now. Monthly work is always paid in advance. */
    public static function split(array $line, bool $full): array
    {
        $g = round($line['amount'] * (1 + self::GST), 2);
        $now = $full || $line['service']['unit'] === 'month' ? $g : round($g / 2, 2);
        return [$g, $now];
    }
}
