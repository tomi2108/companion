import { getOcToken, Openshift } from "../../../interface/oc/oc";
import { promptForOcResource } from "../../../interface/prompts";

export default {
  command: "logs",
  aliases: ["log"],
  describe: "Tail pods's logs",
  handler: async () => {

    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);
    const pods = await project.getPods();
    const pod = await promptForOcResource(pods);

    const logs = await pod.getLogs();
    console.log(logs);
    // const formattedLogs = logs.split("\n").map(tryParseJSONObject).filter(Boolean);
    // // TODO: have a flag -f for formatted logs and no flag for non formatted
    // console.log(formattedLogs);
  }
};
