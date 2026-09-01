"""Volume profile: POC, value area (VAH/VAL), and high/low-volume nodes.

Because the MVP's order-flow layer is bar-aggregated rather than raw tick
data (see synthetic_generator.py), each bar's volume is distributed
uniformly across the price buckets its high-low range spans. This is a
standard approximation when true per-trade prices aren't available, and is
documented as such — it is NOT the same fidelity as a profile built from
real tick data.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass

from edge_lab.models import OHLCVBar


@dataclass(frozen=True)
class VolumeProfileLevel:
    price: float
    volume: float


@dataclass(frozen=True)
class VolumeProfileResult:
    levels: list[VolumeProfileLevel]
    poc: float
    vah: float
    val: float
    value_area_volume_pct: float
    high_volume_nodes: list[float]
    low_volume_nodes: list[float]
    total_volume: float


def _bucket_price(price: float, bucket_size: float) -> float:
    return round(round(price / bucket_size) * bucket_size, 8)


def compute_volume_profile(
    bars: Sequence[OHLCVBar],
    tick_size: float,
    bucket_ticks: int = 4,
    value_area_pct: float = 0.70,
) -> VolumeProfileResult:
    if not bars:
        return VolumeProfileResult([], 0.0, 0.0, 0.0, 0.0, [], [], 0.0)

    bucket_size = tick_size * bucket_ticks
    volume_by_bucket: dict[float, float] = {}

    for bar in bars:
        low_bucket = _bucket_price(bar.low, bucket_size)
        high_bucket = _bucket_price(bar.high, bucket_size)
        n_buckets = max(1, round((high_bucket - low_bucket) / bucket_size) + 1)
        volume_per_bucket = bar.volume / n_buckets
        for i in range(n_buckets):
            price = round(low_bucket + i * bucket_size, 8)
            volume_by_bucket[price] = volume_by_bucket.get(price, 0.0) + volume_per_bucket

    sorted_prices = sorted(volume_by_bucket.keys())
    levels = [VolumeProfileLevel(price=p, volume=volume_by_bucket[p]) for p in sorted_prices]
    total_volume = sum(volume_by_bucket.values())

    poc_price = max(volume_by_bucket, key=lambda p: volume_by_bucket[p])
    poc_idx = sorted_prices.index(poc_price)

    value_area_prices = {poc_price}
    accumulated = volume_by_bucket[poc_price]
    low_idx, high_idx = poc_idx, poc_idx
    target = value_area_pct * total_volume

    while accumulated < target and (low_idx > 0 or high_idx < len(sorted_prices) - 1):
        vol_below = volume_by_bucket[sorted_prices[low_idx - 1]] if low_idx > 0 else -1.0
        vol_above = (
            volume_by_bucket[sorted_prices[high_idx + 1]] if high_idx < len(sorted_prices) - 1 else -1.0
        )
        if vol_above >= vol_below:
            high_idx += 1
            accumulated += volume_by_bucket[sorted_prices[high_idx]]
            value_area_prices.add(sorted_prices[high_idx])
        else:
            low_idx -= 1
            accumulated += volume_by_bucket[sorted_prices[low_idx]]
            value_area_prices.add(sorted_prices[low_idx])

    val = sorted_prices[low_idx]
    vah = sorted_prices[high_idx]

    volumes = [volume_by_bucket[p] for p in sorted_prices]
    mean_vol = total_volume / len(volumes)
    variance = sum((v - mean_vol) ** 2 for v in volumes) / len(volumes)
    std_vol = variance**0.5

    high_volume_nodes = [
        sorted_prices[i]
        for i in range(len(sorted_prices))
        if volumes[i] > mean_vol + std_vol
        and (i == 0 or volumes[i] >= volumes[i - 1])
        and (i == len(volumes) - 1 or volumes[i] >= volumes[i + 1])
    ]
    low_volume_nodes = [
        sorted_prices[i]
        for i in range(len(sorted_prices))
        if volumes[i] < max(mean_vol - std_vol, 0)
        and (i == 0 or volumes[i] <= volumes[i - 1])
        and (i == len(volumes) - 1 or volumes[i] <= volumes[i + 1])
    ]

    return VolumeProfileResult(
        levels=levels,
        poc=poc_price,
        vah=vah,
        val=val,
        value_area_volume_pct=accumulated / total_volume if total_volume else 0.0,
        high_volume_nodes=high_volume_nodes,
        low_volume_nodes=low_volume_nodes,
        total_volume=total_volume,
    )
