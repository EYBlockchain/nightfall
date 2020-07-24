# Contributing to Nightfall

As an auditor, EY has to comply with strict procedures to ensure that we maintain independence from
any organisations we audit. Accordingly, we would be very grateful to receive PRs for bug fixes or
efficiency improvements to the existing code. New features should be added by forking this
repository.

The requirement to maintain independence is also the reason that we have waived all copyright and
placed the code in the public domain, rather than using a more conventional open source licensing
approach.

## Branch policy

The [master branch](https://github.com/EYBlockchain/nightfall/tree/master) is a supported version per our [security policy](https://github.com/EYBlockchain/nightfall/security/policy). Please make all pull requests against this version, unless you have a specific reason to branch off of another branch.

## Commit policy

We will prefer if your commit messages can please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Some examples of good commit messages include:

* `feat(code): proofs presented in more compact form`
* `fix: remove appending of '1' to inputs`
* `refactor(UI): new restfull api used`

## Best practices

We recognize certain development best practices and document them here to aid contributors, promote consistent practices and make reference easy.

### Docker Compose

* Bind mounts
  * Use read only (`:ro`) for bind mounts if possible, or document why you need writable, in docker-compose.yml.
    * [Docker bind mount documentation](https://docs.docker.com/storage/bind-mounts/#use-a-read-only-bind-mount) — "For some development applications, the container needs to write into the bind mount, so changes are propagated back to the Docker host. At other times, the container only needs read access."
  * Use `cached` if files are expected to be edited on the host machine (e.g. for rapid development) or `delegated` if files are expected to be written on the container.
    * [Docker: Performance tuning for volume mounts](https://docs.docker.com/docker-for-mac/osxfs-caching/)
    * https://stackoverflow.com/a/55461550/300224 — How to use `:ro` with `:cached`
