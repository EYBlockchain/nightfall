truffle-compile:
	docker-compose run --rm truffle-offchain compile --all
	docker-compose run --rm truffle-zkp compile --all

truffle-migrate:
	docker-compose run --rm truffle-offchain migrate --reset --network=default
	docker-compose run --rm truffle-zkp migrate --reset --network=default

offchain-test-migrate:
	docker-compose -f docker-compose.test.yml run --rm truffle-offchain_test migrate --reset --network=default
	docker-compose -f docker-compose.test.yml run --rm truffle-zkp_test migrate --reset --network=default

zkp-start:
	docker-compose run --rm zkp npm start

zkp-test:
	docker-compose run --rm zkp npm t
