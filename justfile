test:
  #!/bin/sh
  set -e
  nix flake check

  for pkg in $(
    nix flake show --json 2>/dev/null |
      jq '.packages | to_entries[] | .value | to_entries[] | select(.value.name != null) | .key' |
      sed 's/"//g'
  ); do
    nix build --no-link --option eval-cache false ".#${pkg}"
  done
