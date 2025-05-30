## How to run

Call in project dir root and ensure that ports are not used by other processes.
```bash
docker compose up -d
npm install
npm run db:run
npm run start
```
Default DB credentials set in Docker compose:
user: postgres
pwd: pass123

Reset DB
```bash
npm run db:drop
npm run db:run
```

Cleanup everything 
```bash
docker-compose down -v
```

## How to test
Please wait 3 min after app start while app generates dummy data. Then you can spy some user id from DB tables.
You can open 2 endpoints using HTTP/GET
http://localhost:3000/aggregated-data/<userId>
http://localhost:3000/aggregated-data/<userId>/payouts?startDate=2025-05-30T00:00:00&endDate=2025-06-30T23:59:59


## Automated Testing proposal
To test aggregation functionality we have to mock database and external APIs so ...
* for database  some kind of "In Memory DB" which can be initialized with fixture data from json/yaml file would work or
use test container when we spin up fresh and initialize it for particular test.
* external API can be mocked up to return hardcoded/generated values

after than we can call http endpoint and verify database state (data in target tables)

## Notes
This version is a draft, and it lacks many things and has bugs as:
1. Originally, I was planning to build a Queue for commands to load the next data window to avoid task overlapping
   for cases when previous task not completed and new one is already fired.
   But in order to get implementation faster, I used a simple cron even without locks.
   Hence, data consistency could be broken because of concurrent cron job execution.

2. It was not really clear from the task description what "list of paidouts" means, and should it be provided by date range or not ?
   So I added a new type of transactions and added date range parameters to the query. 

3. Historical data preloading is not covered at all.
4. Many places has FIXME notes indicating possible problems in real world usage.
5. Currency conversion not done as I did assumtion that Transaction API will return PAID OUTs as a separate transaction type.
6. Some naming cleanup must be done in order to achieve "Naming consistency"
7. Tables created without indexes. It must be done later.
8. ETL must be seperated from front API in order to avoid mutual interference and avoid stealing CPU from each other.
