const Sequelize = require('sequelize');
const db = require('../config/db');
const uuid = require('uuid/v4');
const slug = require('slug');
const shortid = require('shortid');

const Usuarios = require('../models/Usuarios');
const Grupos = require('../models/Grupos');


const Meeti = db.define(
    'meeti', {
        id  : {
            type: Sequelize.UUID,
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
        invitado : Sequelize.STRING,
        cupo : {
            type: Sequelize.INTEGER,
            defaultValue : 0
        },
        pagada : {
            type: Sequelize.INTEGER,
            defaultValue : 0
        },
        valorMeeti : {
            type : Sequelize.TEXT
        },
        zoomId : {
            type : Sequelize.TEXT
        },
        zoomPassword : {
            type : Sequelize.TEXT
        },
        epayco_customerid : {
            type : Sequelize.TEXT
        },
        epayco_secretkey : {
            type : Sequelize.TEXT
        },
        epayco_publickey : {
            type : Sequelize.TEXT
        },
        checkoutTest: {
            type : Sequelize.TEXT
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
        fecha : {
            type : Sequelize.DATEONLY, 
            allowNull : false,
            validate : {
                notEmpty : {
                    msg : 'Agrega una fecha para el Meeti'
                }
            }
        },
        hora : {
            type : Sequelize.TIME, 
            allowNull : false,
            validate : {
                notEmpty : {
                    msg : 'Agrega una hora para el Meeti'
                }
            }
        },
        ciudad : {
            type : Sequelize.STRING, 
            allowNull : false,
            validate : {
                notEmpty : {
                    msg : 'Agrega una Ciudad'
                }
            }
        },
        estado : {
            type : Sequelize.STRING, 
            allowNull : false,
            validate : {
                notEmpty : {
                    msg : 'Agrega un estado'
                }
            }
        },
        pais : {
            type : Sequelize.STRING, 
            allowNull : false,
            validate : {
                notEmpty : {
                    msg : 'Agrega un país'
                }
            }
        },

        interesados : {
            type: Sequelize.ARRAY(Sequelize.INTEGER),
            defaultValue : []
        }
    }, {
        hooks: {
            async beforeCreate(meeti) {
                const url = slug(meeti.titulo).toLowerCase();
                meeti.slug = `${url}-${shortid.generate()}`;
            }
        }
    } );
Meeti.belongsTo(Usuarios);
Meeti.belongsTo(Grupos);

module.exports = Meeti;