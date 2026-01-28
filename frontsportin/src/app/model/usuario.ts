//ruta opcional
export interface IClub {
  id: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  fechaAlta?: string;
  imagen?: string | null;
  temporadas?: number;
  noticias?: number;
  tipoarticulos?: number;
  usuarios?: number;
}

export interface IEquipo {
  id: number;
  nombre: string;
  categoria?: string;
  club?: IClub | null;
  jugadores?: number;
  partidos?: number;
}

export interface ITipoUsuario {
  id: number;
  descripcion: string;
  usuarios?: number;
}

export interface IUsuarioRelacion {
  id: number;
  descripcion?: string;
  nombre?: string;
}

export interface IUsuario {
  id: number;
  nombre: string;
  apellido1: string;
  apellido2: string;
  username: string;
  fechaAlta: string;
  genero: number;
  // Relaciones principales
  tipousuario?: ITipoUsuario | null;
  rolusuario?: IUsuarioRelacion | null;
  club?: IClub | null;
  equipo?: IEquipo | null;
  comentarios: number;
  puntuaciones: number;
  compras?: number;
  comentarioarts: number;
  carritos: number;
  facturas: number;
}
