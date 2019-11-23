# git submodules

## cloning

`git clone --recurse-submodules git@github.com:EYBlockchain/nightfall.git`

## pulling

`git pull --recurse-submodules`

## pushing

`git push --recurse-submodules=check` checks for any changes you might have made in the submodule, and stops you pushing to Nightfall without first pushing to the submodule's remote repository.

## pushing submodule changes to the submodule's repo

`cd merkle-tree`
`git commit -am "commit message"`
`git push origin master`

Now you can safely push to Nightfall:
`cd ..`
`git push  --recurse-submodules=check` (always get in the habit of including the 'check' command)

## checking out a new branch

`git checkout --recurse-submodules master`
