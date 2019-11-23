This config directory is for the 'config' files of any microservices which are git submodules.

We cannot edit the submodule's code directly (because if we were to add nightfall-specific code to the submodule's files, they will not be accepted into the submodule's repository). Therefore, we need the config file to exist separately from the submodule; within nightfall.
