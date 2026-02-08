import os
from azure.identity import DefaultAzureCredential
from azure.ai.ml import MLClient
from azure.ai.ml.entities import ManagedOnlineEndpoint, ManagedOnlineDeployment, Model, Environment, CodeConfiguration

SUBSCRIPTION_ID = os.getenv("AZURE_SUBSCRIPTION_ID", "")
RESOURCE_GROUP = os.getenv("AZURE_RESOURCE_GROUP", "")
WORKSPACE_NAME = os.getenv("AZURE_ML_WORKSPACE", "")


def main():
    if not (SUBSCRIPTION_ID and RESOURCE_GROUP and WORKSPACE_NAME):
        raise RuntimeError("Azure ML workspace environment variables are not set")

    ml_client = MLClient(DefaultAzureCredential(), SUBSCRIPTION_ID, RESOURCE_GROUP, WORKSPACE_NAME)

    endpoint = ManagedOnlineEndpoint(name="fitness-game-churn", auth_mode="key")
    ml_client.begin_create_or_update(endpoint).result()

    model = Model(path="ml_artifacts/churn_model.joblib", name="fitness-game-churn-model")
    env = Environment(
        name="fitness-game-churn-env",
        image="mcr.microsoft.com/azureml/minimal-ubuntu20.04-py38-cpu-inference:latest",
        conda_file="environment.yml"
    )

    deployment = ManagedOnlineDeployment(
        name="blue",
        endpoint_name=endpoint.name,
        model=model,
        environment=env,
        code_configuration=CodeConfiguration(code="scripts", scoring_script="score.py"),
        instance_type="Standard_DS1_v2",
        instance_count=1
    )

    ml_client.begin_create_or_update(deployment).result()
    ml_client.begin_update_endpoint(endpoint_name=endpoint.name, traffic={"blue": 100}).result()


if __name__ == "__main__":
    main()
