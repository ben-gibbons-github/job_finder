slugs=("turo" "dover" "gorgias" "veriff" "bolt" "testgorilla")

echo "--- Testing requested pattern: https://api.breezy.hr/v3/public/board/{slug}/positions ---"
for slug in "${slugs[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "https://api.breezy.hr/v3/public/board/$slug/positions")
  echo "$slug: $status"
done

echo "\n--- Testing alternative pattern: https://{slug}.breezy.hr/positions ---"
for slug in "${slugs[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "https://$slug.breezy.hr/positions")
  echo "$slug: $status"
done
