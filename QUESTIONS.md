- How do I configure my account with `amplify configure`?

[See here](https://medium.com/open-graphql/create-a-multiuser-graphql-crud-l-app-in-10-minutes-with-the-new-aws-amplify-cli-and-in-a-few-73aef3d49545)

- What happens when I deploy my GraphQL API with `amplify add api` and `amplify push`?

Behind the scenes the Amplify CLI will use CloudFormation to configure and deploy a Cognito Users Pool for AuthN/Z, an AppSync GraphQL API and schema as well as a DynamoDB NoSQL table and wire up permissions and everything else needed to link the resources. After everything is deployed and setup, the identifiers for each resource are automatically added to a local aws_exports.js file that is used by AWS Amplify to reference the specific Auth and API cloud back-end resources.
