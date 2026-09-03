#!/bin/sh

set -eu

root=$(git rev-parse --show-toplevel)
guard="$root/scripts/check-api-generated.sh"
generated_files="
$root/lib/api-client-react/src/generated/.api-codegen-check-untracked-$$
$root/lib/api-zod/src/generated/.api-codegen-check-untracked-$$
"
unrelated_file="$root/.api-codegen-check-unrelated-$$"

cleanup() {
  rm -f $generated_files "$unrelated_file"
}
trap cleanup EXIT

for generated_file in $generated_files; do
  : > "$generated_file"
  if sh "$guard"; then
    echo "Expected an untracked generated file to fail the check: $generated_file" >&2
    exit 1
  fi
  rm -f "$generated_file"
done

: > "$unrelated_file"
if ! sh "$guard"; then
  echo "An unrelated untracked file should not fail the check." >&2
  exit 1
fi