package net.ausiasmarch.gesportin.service;

import org.springframework.stereotype.Service;

@Service
public class AleatorioService {

    private final String[] eq1 = {
            "leones", "tiburones", "toros", "lobos",
            "jaguares", "búfalos", "halcones", "dragones",
            "los mejores", "fantásticos", "invencibles",
            "poderosos", "valientes", "rápidos", "furiosos", "indomables", "imparables",
            "legendarios", "épicos", "supremos"
    };

    private final String[] eq2 = {
            "rojos", "azules", "verdes", "amarillos", "negros",
            "blancos", "naranjas", "morados", "grises", "dorados",
            "eléctricos", "cósmicos", "místicos", "sagrados", "gloriosos",
            "celestiales", "eternos", "infinitos"
    };

    private final String[] eq3 = {
            "de primer año", "de segundo año",
    };

    public String primeraMayuscuString(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    public String generarNombreEquipoAleatorio() {
        String nombre = eq1[(int) (Math.random() * eq1.length)] + " " +
                eq2[(int) (Math.random() * eq2.length)];
        if (Math.random() < 0.3) {
            nombre += " " + eq3[(int) (Math.random() * eq3.length)];
        }
        return primeraMayuscuString(nombre);
    }

    private static final String[] LUGARES = {
        "Estadio Municipal", "Polideportivo Central", "Campo Norte", "Pabellón Sur",
        "Estadio La Rosaleda", "Campo de Los Pinos", "Instalaciones Deportivas Norte",
        "Pabellón Polideportivo", "Estadio El Sardinero", "Campo Municipal de Deportes",
        "Pabellón de los Deportes", "Complejo Deportivo", "Estadio Nuevo Arcángel",
        "Campo de Fútbol Municipal", "Piscina Cubierta", "Velódromo Municipal"
    };

    public String generarNombreLugarAleatorio() {
        return LUGARES[(int) (Math.random() * LUGARES.length)];
    }

    public int generarNumeroAleatorioEnteroEnRango(int min, int max) {
        return (int) (Math.random() * (max - min + 1)) + min;
    }

    public double generarNumeroAleatorioDecimalEnRango(double min, double max) {
        return Math.round((Math.random() * (max - min) + min) * 100.0) / 100.0;
    }

    public String eliminarAcentos(String input) {
        String[][] acentos = {
                { "á", "a" }, { "é", "e" }, { "í", "i" }, { "ó", "o" }, { "ú", "u" },
                { "Á", "A" }, { "É", "E" }, { "Í", "I" }, { "Ó", "O" }, { "Ú", "U" },
                { "ñ", "ny" }, { "Ñ", "NY" }
        };
        for (String[] par : acentos) {
            input = input.replace(par[0], par[1]);
        }
        return input;
    }

}
