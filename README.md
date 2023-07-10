# EventBridge Training

This repo contains the setup of an EventBridge with different rules that show
the possiblities this AWS service

## Useful commands
### Deploy infrastructure
`aws-vault exec <PROFILE> -- cdk deploy` 

### Send an event to the EventBridge Bus
`AWS_REGION=eu-central-1 aws-vault exec <PROFILE> -- aws events put-events --entries file://data/article.json`