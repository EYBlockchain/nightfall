# git submodules

## cloning

`git clone --recurse-submodules git@github.com:EYBlockchain/nightfall.git`

## pulling

`git pull --recurse-submodules`

_If you didn't initially clone with the `--recurse-submodules` flag, you might need to `init` the git submodules first:_
`git pull`  
`git submodule update --init --recursive`  
_This will pull the submodules' code into your repo for the first time (as subfolders). Thereafter the `git pull --recurse-submodules` command will pull changes._

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
