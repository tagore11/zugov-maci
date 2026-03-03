import lighthouse from '@lighthouse-web3/sdk';

const lighthouseApiKey = process.env.NEXT_PUBLIC_LH_API_KEY as string;
const lighthouseGateway = process.env.NEXT_PUBLIC_LH_GATEWAY as string;

export const uploadFileToLighthouse = async (file: File[]) => {
  const { data } = await lighthouse.upload(file, lighthouseApiKey);
  return data;
};

export const getDataFromLighthouse = async (hash: string) => {
  try {
    const response = await fetch(`${lighthouseGateway}/ipfs/${hash}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
