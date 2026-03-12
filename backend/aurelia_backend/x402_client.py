"""Server-side x402 payment client for autonomous agent API access.

Uses the Python x402 library with httpx to make paid requests to
external APIs that require HTTP 402 micropayments. The agent wallet
is funded with USDC on Base and signs EIP-3009 authorisations.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any

import httpx

_x402_available = True
try:
    from eth_account import Account
    from x402 import x402Client
    from x402.http.clients import x402HttpxClient
    from x402.mechanisms.evm import EthAccountSigner
    from x402.mechanisms.evm.exact.register import register_exact_evm_client
except ImportError:
    _x402_available = False


@dataclass
class X402Config:
    """Resolved configuration for the server-side x402 client."""

    private_key: str
    timeout: float = 60.0


def load_x402_config() -> X402Config | None:
    """Load x402 config from environment. Returns None if not configured."""
    private_key = os.getenv("EVM_PRIVATE_KEY", "").strip()
    if not private_key:
        return None

    timeout = float(os.getenv("X402_TIMEOUT", "60"))
    return X402Config(private_key=private_key, timeout=timeout)


def _build_client(config: X402Config) -> tuple[Any, Any]:
    if not _x402_available:
        raise RuntimeError(
            "x402 dependencies not installed. "
            "Run: uv add 'x402[httpx]' eth-account"
        )

    account = Account.from_key(config.private_key)
    signer = EthAccountSigner(account)
    client = x402Client()
    register_exact_evm_client(client, signer)
    return client, account


async def paid_get(url: str, config: X402Config | None = None) -> dict[str, Any]:
    """Make a paid GET request to an x402-protected endpoint."""
    cfg = config or load_x402_config()
    if cfg is None:
        raise RuntimeError("EVM_PRIVATE_KEY not set; cannot make paid requests.")

    client, _account = _build_client(cfg)
    async with x402HttpxClient(client, timeout=httpx.Timeout(cfg.timeout)) as http:
        response = await http.get(url)
        response.raise_for_status()
        return response.json()


async def paid_post(
    url: str,
    json_body: dict[str, Any] | list[Any] | None = None,
    config: X402Config | None = None,
) -> dict[str, Any]:
    """Make a paid POST request to an x402-protected endpoint."""
    cfg = config or load_x402_config()
    if cfg is None:
        raise RuntimeError("EVM_PRIVATE_KEY not set; cannot make paid requests.")

    client, _account = _build_client(cfg)
    async with x402HttpxClient(client, timeout=httpx.Timeout(cfg.timeout)) as http:
        response = await http.post(url, json=json_body)
        response.raise_for_status()
        return response.json()


def get_agent_wallet_address(config: X402Config | None = None) -> str | None:
    """Return the public address of the configured agent wallet."""
    cfg = config or load_x402_config()
    if cfg is None or not _x402_available:
        return None

    account = Account.from_key(cfg.private_key)
    return account.address
