import axios from "axios";

export const getChurnProbability = async (endpointUrl: string, apiKey: string, features: number[]) => {
  const response = await axios.post(
    endpointUrl,
    { features },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      timeout: 8000
    }
  );

  return response.data?.churn_probability as number;
};
