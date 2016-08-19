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
      cron: '45 11 * * *'
      query: hostname: server1 AND tags: http_access
      format: 'Traffic down'
    
      timeFrame: 1 days
      min_hits: 10000
    
      alert:
      - slack
    
      slack:
        channel: '@yourname'
        icon_emoji: ':ghost:'
