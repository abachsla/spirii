This version is a draft of the initial idea, and it lacks many things and has bugs as:
1. Aggregation math is not done in a "Floating point save" manner, and a special math library must be used for that matter.
2. Originally, I was planning to build a query with commands to load the next data window, but in order to get implementation faster,
   I used a simple cron. Hence, data consistency could be broken because of concurrent cron job execution.

3. It was not really clear from the task description what "list of paidouts" means, and should it be provided by date range or not ?
   So I added a new type. Also I was palnning to use Fact/Dimension table with data aggregated with a size of 1 min, but had no time to implement it. 


```bash
docker compose up -d
npm install
npm run db:run
npm run start:dev
```