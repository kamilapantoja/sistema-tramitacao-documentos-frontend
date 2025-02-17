import { Documento } from "./documento";
import { Tramitacao } from "./tramitacao";

export type DocumentoRow = Documento & {
    tramitacaoMaisRecente?: Tramitacao;
    // setorEnvio?: string;
    // dataEnvio?: Date;
    // setorRecebimento?: string;
    // dataRecebimento?: Date;
};
