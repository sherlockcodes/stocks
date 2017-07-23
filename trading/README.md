# Simple Stock Trading Application

The application consists of 2 processes:

  - [`google-finance-feed-worker`](#google-finance-feed-worker)
  - [`web`](#web)

## How to Start a Server?

Go to project root directory and then execute given commands below:

```shell
cd web
node server.js
```

Now, node server will start and listen at port 80. 

### Google Finance Feed Worker

The process will pull latest stock information from google finance api and update the price on Redis and MongoDB every minute. 


### Web

The process is serving an HTTP API to return the user, stock, portfolio, holding and trade details.

  - `GET /stock/<stock_id>`
  - `GET /user/<user_id>`
  - `GET /<user_id>/holdings/`
  - `GET /<user_id>/returns/`
  - `GET /<user_id>/portfolio/?limit=5&page=1`
  - `GET /<user_id>/returns/`
  - `POST /order`
  - `POST /order/<order_id>/<action>`
