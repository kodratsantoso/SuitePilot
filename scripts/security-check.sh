#!/usr/bin/env sh
set -eu

echo "Running security configuration checks..."

if grep -R "sk-[A-Za-z0-9]\\{20,\\}" app .github deploy scripts --exclude-dir=node_modules --exclude-dir=.next >/dev/null 2>&1; then
  echo "Potential hardcoded OpenAI-style key detected" >&2
  exit 1
fi

if grep -R "password.*=.*[^$]" .github deploy scripts --include='*.yml' --include='*.yaml' --include='*.sh' --exclude='security-check.sh' >/dev/null 2>&1; then
  echo "Potential plaintext password assignment detected in deployment assets" >&2
  exit 1
fi

test -f app/.ssot/delivery/SECURITY_COMPLIANCE.md
test -f app/backend/src/lib/crypto.ts

echo "Security checks passed"
