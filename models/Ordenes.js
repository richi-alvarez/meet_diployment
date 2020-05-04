const Sequelize = require('sequelize');
const db = require('../config/db');
const uuid = require('uuid/v4');
const slug = require('slug');
const shortid = require('shortid');

const Usuarios = require('../models/Usuarios');
const Meeti = require('../models/Meeti');


const Ordenes = db.define(
    'orden', {
        id  : {
            type: Sequelize.STRING,
            primaryKey : true,
            allowNull : false
        }, 
        titulo : {
            type : Sequelize.STRING,
            allowNull : false,
            validate : {
                notEmpty : {
                    msg : 'Agrega un Titulo'
                }
            }
        }, 
        slug : {
            type: Sequelize.STRING,
        },
        activo : {
            type: Sequelize.INTEGER,
            defaultValue : 0
        },
        descripcion : {
            type : Sequelize.TEXT, 
            allowNull : false,
            validate : {
                notEmpty : {
                    msg : 'Agrega una descripción'
                }
            }
        },
        // fecha : {
        //     type : Sequelize.DATEONLY, 
        //     allowNull : false,
        //     validate : {
        //         notEmpty : {
        //             msg : 'Agrega una fecha para el Meeti'
        //         }
        //     }
        // },
        // hora : {
        //     type : Sequelize.TIME, 
        //     allowNull : false,
        //     validate : {
        //         notEmpty : {
        //             msg : 'Agrega una hora para el Meeti'
        //         }
        //     }
        // },
        // direccion : {
        //     type : Sequelize.STRING, 
        //     allowNull : false,
        //     validate : {
        //         notEmpty : {
        //             msg : 'Agrega una dirección'
        //         }
        //     }
        // },
        // ciudad : {
        //     type : Sequelize.STRING, 
        //     allowNull : false,
        //     validate : {
        //         notEmpty : {
        //             msg : 'Agrega una Ciudad'
        //         }
        //     }
        // },
        // estado : {
        //     type : Sequelize.STRING, 
        //     allowNull : false,
        //     validate : {
        //         notEmpty : {
        //             msg : 'Agrega un estado'
        //         }
        //     }
        // }
        // pais : {
        //     type : Sequelize.STRING, 
        //     allowNull : false,
        //     validate : {
        //         notEmpty : {
        //             msg : 'Agrega un país'
        //         }
        //     }
        // },   
        //      interesados : {
        //     type: Sequelize.ARRAY(Sequelize.INTEGER),
        //     defaultValue : []
        // }
    
    }, {
        hooks: {
            async beforeCreate(orden) {
                const url = slug(orden.titulo).toLowerCase();
                orden.slug = `${url}-${shortid.generate()}`;
            }
        }
    } );
    Ordenes.belongsTo(Usuarios);
    Ordenes.belongsTo(Meeti);

module.exports = Ordenes;