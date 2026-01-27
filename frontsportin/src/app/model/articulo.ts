export interface IArticulo{
    id: number
    descripcion: string
    precio: number
    descuento: number
    imagen: Blob
    idTipoArticulo: number
    idClub: number
}