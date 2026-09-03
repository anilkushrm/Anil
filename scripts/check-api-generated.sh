#!/bin/sh

set -eu

cd "$(git rev-parse --show-toplevel)"

generated_paths="
lib/api-client-react/src/generated
lib/api-zod/src/generated
"

if ! git diff --quiet -- $generated_paths; then
  echo "Generated API files differ from the committed output." >&2
  exit 1
fi

untracked_files=$(git ls-files --others --exclude-standard -- $generated_paths)
if [ -n "$untracked_files" ]; then
  echo "Generated API files include untracked output:" >&2
  printf '%s\n' "$untracked_files" >&2
  exit 1
fi