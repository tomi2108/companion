import { AxiosInstance } from "axios";

export async function iterateEndpoint<T>(
  sonar: AxiosInstance,
  endpoint: string,
  key: string,
  params?: Record<string, string | number | boolean>
) {
  let i = 0;
  let total = Infinity;
  let res: T[] = [];
  const ps = 500;
  do {
    const { data } = await sonar.get(endpoint, { params: { p: i + 1, ps, ...params } });
    total = data.paging.total;
    res = [...res, ...data[key] as T[]];
    i++;
  } while (i * ps < total);
  return res;
}

