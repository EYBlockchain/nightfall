import express from 'express';
import { loginHandler, createAccountHandler, loadVks } from '../services/api-gateway';

const router = express.Router();

/**
 * @api {post} /login SignIn a User
 * @apiVersion 1.0.0
 * @apiName Login
 * @apiGroup User
 *
 * @apiParam (Request body) {String} name The User name
 * @apiParam (Request body) {String} password The User Password
 *
 * @apiExample {js} Example usage:
 * const data = {
 *   "name": "bob",
 *   "password": "mySecertPassword"
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} token The JWT token hash
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *     {
 *	    "_id":"5cde76bb0fd05867b4421524",
 *	    "name":"bob",
 *	    "email":"bob@ey.com",
 *	    "address":"0xc66a5156a3aa9ad2181916c587551bf779f4decf",
 *	    "shh_identity":"",
 *	    "coin_shield_contracts":[],
 *	    "token_shield_contracts":[],
 *	    "accounts":[],
 *	    "secretkey":"0xc82bf61f0132476a596527ebbb9afb80e102d70f245c17a29c5ce8",
 *	    "publickey":"0x0e77a2a30b197328ec03bc2af73bc2f7809c46c5cc1e9069aa76dd",
 *	    "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Y2RlNzZiYjBmZDA1ODY3YjQ0MjE1MjQiLCJuYW1lIjoiYyIsImVtYWlsIjoiYyIsImFkZHJlc3MiOiIweGM2NmE1MTU2YTNhYTlhZDIxODE5MTZjNTg3NTUxYmY3NzlmNGRlY2YiLCJzaGhfaWRlbnRpdHkiOiIiLCJjb2luX3NoaWVsZF9jb250cmFjdHMiOltdLCJ0b2tlbl9zaGllbGRfY29udHJhY3RzIjpbXSwiYWNjb3VudHMiOltdLCJzZWNyZXRrZXkiOiIweGM4MmJmNjFmMDEzMjQ3NmE1OTY1MjdlYmJiOWFmYjgwZTEwMmQ3MGYyNDVjMTdhMjljNWNlOCIsInB1YmxpY2tleSI6IjB4MGU3N2EyYTMwYjE5NzMyOGVjMDNiYzJhZjczYmMyZjc4MDljNDZjNWNjMWU5MDY5YWE3NmRkIiwiX192IjowLCJwYXNzd29yZCI6ImZkYmJhMzM4ZjkxM2IzYTQ0NTI1ZGM0YjlkYmEwMDI1IiwiaWF0IjoxNTU4MDgzMzMwfQ.CIGbp9JG7vSAE4__wD7yn7Yx0aouX6b4kpF07nyrC7k"
 *     }
 *
 * @apiUse UnauthorizedError
 */
router.route('/login').post(loginHandler);

/**
 * @api {post} /createAccount SignUp a User
 * @apiVersion 1.0.0
 * @apiName SignUp
 * @apiGroup User
 *
 * @apiParam (Request body) {String} name The User name
 * @apiParam (Request body) {String} email The User Email
 * @apiParam (Request body) {String} password The User Password
 *
 * @apiExample {js} Example usage:
 * const data = {
 *   "name": "bob",
 *   "email": 'bob@email.com',
 *   "password": "mySecertPassword"
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {Object} user_data User Record from db.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *	  {
 *		"_id":"5cdee9532a2b8e79c4cc5d55",
 *		"name":"a",
 *		"email":"a",
 *		"address":"0xca5d1a499b1cc3aa889df3d36040e4757886a9eb",
 *		"shh_identity":"",
 *		"coin_shield_contracts":[],
 *		"token_shield_contracts":[],
 *		"accounts":[],
 *		"secretkey":"0x683a43864f6e879e0762ef81c13bee37514c955e407a9d622e3ddb",
 *		"publickey":"0x7a6f5a60ebd7143ac1b1645d08308daff4b157476a8686c45948c1"
 *	  }
 *
 * @apiUse NameInUse
 */
router.route('/createAccount').post(createAccountHandler);

// vk APIs
router.route('/vk').post(loadVks);

export default router;
