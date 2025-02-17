import { Documento } from "./documento";
import { Tramitacao } from "./tramitacao";

export type DocumentoRow = Documento & {
    tramitacaoMaisRecente?: Tramitacao;
};
