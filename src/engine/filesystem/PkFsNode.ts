export enum PkFsNodeType {
    FILE,
    FOLDER
}

export type PkFsNode = {
    name: string,
    type: PkFsNodeType,
    children?: PkFsNode[]
}
