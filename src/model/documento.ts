import { TipoDocumento } from "./tipoDocumento";
import { Tramitacao } from "./tramitacao";

export interface Documento {
  id: number;
  nroDocumento: string;
  titulo: string;
  pathArquivoPDF: string;
  tramitacoes: Tramitacao[];
  prettyName: string;
  tipoDocumento: TipoDocumento
  descDocumento: string
}
