import { Setor } from "./setor";

export interface Tramitacao {
    id: number;
    dataHoraEnvio: string;
    dataHoraRecebido: string;
    setorEnvia: Setor;
    setorRecebe: Setor;
}
