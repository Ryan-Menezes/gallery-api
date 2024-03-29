# Gallery API REST
Api for managing a gallery
## Settings
Have [Node.js](https://nodejs.org/pt-br/) installed on your machine and through your terminal enter the project directory and run the command "npm install":
```sh
cd "project directory"
npm install
```
After that make sure that [MongoDB](https://www.mongodb.com/) is installed on your machine and run the command "mongod" in a separate terminal to start the mongo server:
```sh
mongod
```
Finally, start the node.js server with the command "npm start" in a separate terminal:
```sh
cd "project directory"
npm start
```

Resources available for access via API:
* [**Auth**](#reference/resources/auth)
* [**Users**](#reference/resources/users)
* [**Galleries**](#reference/resources/galleries)

## Métodos
API requests must follow the standards:

| Method | Description |
|---|---|
| `GET` | Returns information from one or more records. |
| `POST` | Used to create a new record. |
| `PUT` | Update record data or change its status. |
| `DELETE` | Remove a system registry. |

## Responses

| Code | Description |
|---|---|
| `200` | Request executed successfully.|
| `201` | A new record was created successfully.|
| `204` | No data to present.|
| `400` | Validation errors or the fields entered do not exist in the system.|
| `401` | Invalid login data.|
| `403` | Resource access prohibited.|
| `404` | Searched record not found (Not found).|
| `405` | Method not implemented.|
| `410` | Searched record has been deleted from the system and is no longer available.|
| `422` | Data entered is outside the scope defined for the field.|
| `429` | Maximum number of requests reached. (*wait a few seconds and try again*)|

## List
Depending on which endpoint you are calling via GET, there may be more parameters available for fetching, but the default will always be this:
The `list` actions allow sending the following parameters:

| Param | Description | Type |
|---|---|---|
| `skip(Optional)` | Informs the beginning of the listing (by default it starts with 0). | Integer |
| `limit(Optional)` | Returned data limit (by default it starts with 10). | Integer |

## Auth [/auth]

### Login (/auth) [GET]

| Param | Description | Type |
|---|---|---|
| `email` | Access `email`. | String |
| `password` | Access `password`. | String |

+ Request (application/json)

    + Body

            {
                "email": "test@gmail.com",
                "password": "12345678"
            }

+ Response 200 (application/json)

    + Body

            {
                "status": 200,
                "message": "OK",
                "token": "access_token"
            }

## Users [/users]

### List (/users) [GET]

| Param | Description | Type |
|---|---|---|
| `skip(Optional)` | Informs the beginning of the listing (by default it starts with 0). | Integer |
| `limit(Optional)` | Returned data limit (by default it starts with 10). | Integer |
| `first_name(Optional)` | Firts name of user. | String |
| `last_name(Optional)` | Last name of user. | String |
| `email(Optional)` | Email of user. | String |

+ Request (application/json)

    + Headers

            Authorization: Bearer [access_token]

    + Body

            {
                "skip": 0,
                "limit": 10,
                "first_name": "test",
                "last_name": "test",
                "email": "test@gmail.com"
            }

+ Response 200 (application/json)

    + Body

            {
                "status": 200,
                "message": "OK",
                "total": 1,
                "users": [
                    {
                        "_id": "629771f2c7a9cf196283f4a0",
                        "first_name": "Ryan",
                        "last_name": "Menezes",
                        "email": "ryan@gmail.com",
                        "avatar": "http://localhost:3000/medias/test.jpg",
                        "created_at": "2022-06-01T14:03:34.330Z",
                        "updated_at": "2022-06-01T14:03:34.330Z"
                    }
                ]
            }
            
+ Response 204 (application/json)

+ Response 500 (application/json)

    + Body

            {
                "status": 500,
                "message": "Internal Server Error",
                "errors": []
            }

### Find (/users/{id}) [GET]

+ Request (application/json)

    + Headers

            Authorization: Bearer [access_token]

+ Response 200 (application/json)

    + Body

            {
                "status": 200,
                "message": "OK",
                "user": {
                    "_id": "629771f2c7a9cf196283f4a0",
                    "first_name": "Ryan",
                    "last_name": "Menezes",
                    "email": "ryan@gmail.com",
                    "avatar": "http://localhost:3000/medias/test.jpg",
                    "created_at": "2022-06-01T14:03:34.330Z",
                    "updated_at": "2022-06-01T14:03:34.330Z"
                }
            }
            
+ Response 404 (application/json)

    + Body

           {
                "status": 404,
                "message": "Not Found"
           }

+ Response 500 (application/json)

    + Body

            {
                "status": 500,
                "message": "Internal Server Error",
                "errors": []
            } 
            
### Create (/users) [POST]

| Param | Description | Type |
|---|---|---|
| `first_name` | Firts name of user. | String |
| `last_name` | Last name of user. | String |
| `email` | Email of user. | String |
| `password` | Password of user. | String |
| `avatar(Optional)` | Avatar of user. | File(Image) |

+ Request (application/json)

    + Headers

            Authorization: Bearer [access_token]

    + Body

            {
                "first_name": "test",
                "last_name": "test",
                "email": "test@gmail.com",
                "password": "12345678",
                "avatar": [FILE]
            }

+ Response 200 (application/json)

    + Body

            {
                "status": 201,
                "message": "Created",
                "user": {
                    "first_name": "Ryan",
                    "last_name": "Menezes",
                    "email": "ryan@gmail.com",
                    "password": "$2a$10$bPg8HvCEHplspBMMlKf21OhE8S8xSF4I98FWhLJHCHfDQd1rOfqRa",
                    "avatar": "http://localhost:3000/medias/test.jpg",
                    "created_at": "2022-06-06T19:09:16.938Z",
                    "updated_at": "2022-06-06T19:09:16.938Z",
                    "_id": "629e544e9ac01bbd8395ef41"
                }
            }

+ Response 500 (application/json)

    + Body

            {
                "status": 500,
                "message": "Internal Server Error",
                "errors": []
            }                       
            
### Update (/users/{id}) [PUT]

| Param | Description | Type |
|---|---|---|
| `first_name(Optional)` | Firts name of user. | String |
| `last_name(Optional)` | Last name of user. | String |
| `email(Optional)` | Email of user. | String |
| `password(Optional)` | Password of user. | String |
| `avatar(Optional)` | Avatar of user. | File(Image) |

+ Request (application/json)

    + Headers

            Authorization: Bearer [access_token]

    + Body

            {
                "first_name": "test",
                "last_name": "test",
                "email": "test@gmail.com",
                "password": "12345678",
                "avatar": [FILE]
            }

+ Response 200 (application/json)

    + Body

            {
                "status": 200,
                "message": "Created",
                "user": {
                    "first_name": "Ryan",
                    "last_name": "Menezes",
                    "email": "ryan@gmail.com",
                    "password": "$2a$10$bPg8HvCEHplspBMMlKf21OhE8S8xSF4I98FWhLJHCHfDQd1rOfqRa",
                    "avatar": "http://localhost:3000/medias/test.jpg",
                    "created_at": "2022-06-06T19:09:16.938Z",
                    "updated_at": "2022-06-06T19:09:16.938Z",
                    "_id": "629e544e9ac01bbd8395ef41"
                }
            }

+ Response 404 (application/json)

    + Body

           {
                "status": 404,
                "message": "Not Found"
           }

+ Response 500 (application/json)

    + Body

            {
                "status": 500,
                "message": "Internal Server Error",
                "errors": []
            }  
            
 ### Delete (/users/{id}) [DELETE]

| Param | Description | Type |
|---|---|---|
| `force(Optional)` | If "true" or record will actually be accessible to the database, otherwise softdelete will be used(By default it is false). | Boolean |

+ Request (application/json)

    + Headers

            Authorization: Bearer [access_token]

    + Body

            {
                "force": "false"
            }

+ Response 200 (application/json)

    + Body

            {
                "status": 200,
                "message": "OK",
                "user": {
                    "_id": "62976623217abe860f1706f2",
                    "first_name": "Ryan",
                    "last_name": "Menezes",
                    "email": "ryan@gmail.com",
                    "avatar": "http://localhost:3000/medias/test.jpg",
                    "created_at": "2022-06-01T13:12:36.344Z",
                    "updated_at": "2022-06-01T13:12:36.344Z"
                }
            }

+ Response 404 (application/json)

    + Body

           {
                "status": 404,
                "message": "Not Found"
           }

+ Response 500 (application/json)

    + Body

            {
                "status": 500,
                "message": "Internal Server Error",
                "errors": []
            }    
