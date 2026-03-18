import { File } from "@files/file";
import { Dir } from "@interface/dirs/dir";

import { CreateApp } from "..";
import { ProjectLayout } from "./layout";
import { AmqReciever } from "../capabilities/amq_reciever";
import { AmqSender } from "../capabilities/amq_sender";
import { S3Capability } from "../capabilities/s3";
import { ApigwConnection } from "../connections/apigw";
import { Digit3Connection } from "../connections/digit3";
import { MongoConnection } from "../connections/mongo";
import { SqlConnection } from "../connections/sql";

export interface FileGroup {
  name: string;
  files(layout: ProjectLayout): (File<unknown> | Dir)[];
  appliesTo(app: CreateApp): boolean;
}

export const SqlFileGroup: FileGroup = {
  name: "sql",

  files(layout) {
    return [
      layout.models.getFile("SequelizeExample.ts"),
      layout.configFile("dao_db.ts"),
      layout.configFile("dao_environment.ts"),
      layout.testConfigFile("sequelize.test.ts"),
      layout.testsConfiguration,
      layout.models
    ];
  },

  appliesTo(app) {
    return app.connection instanceof SqlConnection;
  }
};

export const MongoFileGroup: FileGroup = {
  name: "mongo",

  files(layout) {
    return [
      layout.models.getFile("MongooseExample.ts"),
      layout.configFile("bau_db.ts"),
      layout.configFile("bau_environment.ts"),
      layout.models
    ];
  },

  appliesTo(app) {
    return app.connection instanceof MongoConnection;
  }
};

export const WrkFileGroup: FileGroup = {
  name: "wrk",

  files(layout) {
    return [
      layout.services.getFile("main.ts"),
      layout.src.getFile("wrk_app.ts")
    ];
  },

  appliesTo(app) {
    return app.type === "wrk";
  }
};

export const CrnFileGroup: FileGroup = {
  name: "crn",

  files(layout) {
    return [
      layout.src.getFile("main.ts"),
      layout.services.getFile("main.ts")
    ];
  },

  appliesTo(app) {
    return app.type === "crn";
  }
};

export const ApigwFileGroup: FileGroup = {
  name: "apigw",

  files(layout) {
    return [
      layout.configFile("apigw_environment.ts"),
      layout.services.getFile("ApigwTokenService.ts"),
      layout.testsServices.getFile("apigw.test.ts"),
      layout.tests.getFile("apigw_setupTest.ts")
    ];
  },

  appliesTo(app) {
    return app.connection instanceof ApigwConnection;
  }
};

export const Digit3FileGroup: FileGroup = {
  name: "digit3",

  files(layout) {
    return [
      layout.configFile("digit3_environment.ts"),
      layout.services.getFile("Digit3TokenService.ts"),
      layout.testsServices.getFile("digit3.test.ts"),
      layout.tests.getFile("digit3_setupTest.ts")
    ];
  },

  appliesTo(app) {
    return app.connection instanceof Digit3Connection;
  }
};

export const IntTestSupportGroup: FileGroup = {
  name: "int-test-support",

  files(layout) {
    return [layout.testsServices];
  },

  appliesTo(app) {
    return app.type === "int";
  }
};

export const FcdEnvFileGroup: FileGroup = {
  name: "fcd",

  files(layout) {
    return [layout.configFile("fcd_environment.ts")];
  },

  appliesTo(app) {
    return app.type === "fcd";
  }
};

export const S3FileGroup: FileGroup = {
  name: "s3",

  files(layout) {
    return [
      layout.configFile("s3.ts"),
      layout.configFile("s3_environment.ts")
    ];
  },

  appliesTo(app) {
    return app.capabilities?.some((c) => c instanceof S3Capability);
  }
};

export const AmqSenderFileGroup: FileGroup = {
  name: "amq-sender",

  files(layout) {
    return [
      layout.configFile("amq_sender.ts"),
      layout.configFile("amq_environment.ts")
    ];
  },

  appliesTo(app) {
    return app.capabilities?.some((c) => c instanceof AmqSender);
  }
};

export const AmqReceiverFileGroup: FileGroup = {
  name: "amq-receiver",

  files(layout) {
    return [
      layout.configFile("amq_receiver.ts"),
      layout.configFile("amq_environment.ts")
    ];
  },

  appliesTo(app) {
    return app.capabilities?.some((c) => c instanceof AmqReciever);
  }
};

export const FILE_GROUPS: FileGroup[] = [
  SqlFileGroup,
  MongoFileGroup,

  WrkFileGroup,
  CrnFileGroup,

  ApigwFileGroup,
  Digit3FileGroup,
  IntTestSupportGroup,

  FcdEnvFileGroup,

  S3FileGroup,
  AmqSenderFileGroup,
  AmqReceiverFileGroup
];

