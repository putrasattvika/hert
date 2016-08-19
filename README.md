#HERT

Hert (Hit and Alert) is a simple alerting system from the amount of document hits in data source.

## rules
- there are min X hits in Y time
- there are max X hits in Y time
- there are min X % changes hits from last hits
- there are max X % changes hits from last hits

## data source
- Elasticsearch
- Next, mongo ?

## alert type
- Slack
- Next, email ?

##config:
    - name: application_processor
      source: elasticsearch
      cron: '1 1 * * *'
      query: hostname: server1 AND tags: http_access
      format: 'Oh no, traffic down'
    
      timeFrame: 1 days
      min_hits: 10000
    
      alert:
      - slack
    
      slack:
        channel: '@yourname'
        icon_emoji: ':ghost:'

The task will run query every 01:01, if there is < 10000 hits in last 1 days, send alert to slack with message
`Oh no, traffic down`