import { AppRepo } from "@interface/dirs/app_repo";
import { SonarQube } from "@interface/sonar";
import { SonarScanner } from "@interface/sonar/scanner";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";

type Reads = { app_repo: AppRepo };
type Writes = {};

const comparators = { GT: "<", LT: ">" };
const titles = {
  new_reliability_rating: "Reliability on new code",
  reliability_rating: "Reliability",
  new_maintainability_rating: "Maintainability on new code",
  sqale_rating: "Maintainability",
  duplicated_lines_density: "Duplicated lines",
  new_duplicated_lines_density: "Duplicated lines on new code",
  new_technical_debt: "Added technical debt",
  new_coverage: "Coverage on new code"
};

export class AppScan extends WorkflowStep<Reads, Writes> {

  async run(_: ExecutionContext, { app_repo }: Reads) {
    const { name } = await app_repo.getInfo();
    const sonar = new SonarQube();
    const projects = await sonar.getProjects();
    const project = projects.find((p) => p.key.includes(name));
    if (!project) throw new Error(`Sonar project not found for ${name}`);

    // TODO(20260318-002434): I dont like doing this here... should probably be delegated to
    // the execution context in some way and/or to the scanner
    // also think about how AppRepo and SonarProject should relate
    process.chdir(app_repo.dir.path);
    await new SonarScanner().scan(project);

    const [
      // code_smells,
      // hotspots,
      quality_gates
    ] = await Promise.all([
      // project.getCodeSmells(),
      // project.getHotspots(),
      project.getQualityGates()
    ]);

    const scan = quality_gates.map((qg) => ({
      key: titles[qg.metricKey as keyof typeof titles],
      value: qg.actualValue,
      comparator: comparators[qg.comparator as keyof typeof comparators],
      threshold: qg.errorThreshold,
      ok: qg.status === "OK"
    }));

    // TODO(20260318-002417): figure out how to show second table
    // const second_table = new Table({
    //   head: [name, "Value"],
    //   style: { compact: true }
    // });
    //
    // const iterate = [
    //   { title: "Total code smells", arr: code_smells },
    //   { title: "Total security hotspots", arr: hotspots }
    // ];
    //
    // for (const { title, arr } of iterate) {
    //   const color = arr.length === 0 ? chalk.green : chalk.red;
    //   second_table.push([
    //     title,
    //     color(arr.length)
    //   ]);
    //
    // }

    return { project, scan };
  }
}