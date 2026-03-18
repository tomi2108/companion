import { JsonFile } from "./json_file";

type PackageJsonContent = {
  name: string;
  version: string;
  description: string;
  author?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

export class PackageJson extends JsonFile<PackageJsonContent> {

}
