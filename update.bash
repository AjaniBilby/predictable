#!/usr/bin/env bash

echo "Fetching changes"
git fetch

if [ -z "$(git diff origin/production)" ]; then
	echo "No changes to pull"
	exit 0
fi

echo "Pulling changes"
git pull origin production

bash ./upgrade.bash