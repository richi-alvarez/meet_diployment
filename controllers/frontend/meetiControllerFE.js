const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const Categorias = require('../../models/Categorias');
const Comentarios = require('../../models/Comentarios');
const Ordenes = require('../../models/Ordenes');
const moment = require('moment');
const Sequelize = require('sequelize');
const uuid = require('uuid/v4');
const Op = Sequelize.Op;

exports.mostrarMeeti = async (req, res,next) => {
    const meeti = await Meeti.findOne({ 
        where : {
            slug : req.params.slug          
        }, 
        include : [
            { 
                model: Grupos
            }, 
            {
                model : Usuarios,
                attributes : ['id', 'nombre', 'imagen']
            }
        ]
    });
   
    // Si no existe
    if(!meeti) {
        res.redirect('/');
    }
    var userCount=false;
try {
    if(meeti.usuarioId===req.user.id){
        userCount = true;
    }
    console.log(userCount)
} catch (error) {
    res.redirect('/administracion');
}
   
    


    // Consultar después de verificar que existe el meeti
    const comentarios = await Comentarios.findAll({
            where: { meetiId : meeti.id }, 
            include : [
                { 
                    model : Usuarios,
                    attributes : ['id', 'nombre', 'imagen']
                }
            ]
    })

    //validar si el meeti se cobra o no, con el condicional
    /** si se debe pagar sigue con el proceso siguiente sino, se hace un update a orden en el activo en 1  */

    const ordenes = await Ordenes.findAll({
        where: { meetiId : meeti.id , usuarioId : req.user.id},
        include : [
            { 
                model : Usuarios,
                attributes : ['id', 'nombre', 'imagen']
                
            }
        ]
})
// console.log('========',ordenes);
// console.log('====2222====',ordenes.length)
if(ordenes.length===0)
{
    // console.log('====3333====',ordenes,req.headers.referer)
  var orden_ ={};
}

for (var key in ordenes) {
     orden_ = ordenes[key];
}
var orden={};
var url_={};
if(userCount)
{
     url_= { url: req.headers.referer+'zoom/'+meeti.id};
     orden = Object.assign(orden_, url_);
}else{
     url_={ url: req.headers.referer+'zoom/'+orden_.id};
     orden = Object.assign(orden_, url_);
}



    // pasar el resultado hacia la vista
    
    res.render('mostrar-meeti', {
        nombrePagina : meeti.titulo,
        meeti, 
        comentarios, 
        orden,
        moment,
        userCount
    })
}


// Confirma o cancela si el usuario asistirá al meeti
exports.confirmarAsistencia = async (req, res) => {

    console.log(req.body);


    const { accion } = req.body;

    if(accion === 'confirmar') {
        // agregar el usuario
        Meeti.update(
            {'interesados' :  Sequelize.fn('array_append', Sequelize.col('interesados'), req.user.id  ) },
            {'where' : { 'slug' : req.params.slug }}
        );
        // mensaje
         res.send('Has confirmado tu asistencia');
    } else {
        // cancelar la asistencia
        Meeti.update(
            {'interesados' :  Sequelize.fn('array_remove', Sequelize.col('interesados'), req.user.id  ) },
            {'where' : { 'slug' : req.params.slug }}
        );
        // mensaje
         res.send('Has Cancelado tu asistencia');
    }
}


// Confirma pago si el usuario asistirá al meeti
exports.confirmarPago = async (req, res) => {

    try {
  //validar si existe la orden
        const id_ = req.body.slug+'_'+req.body.usuarioId;
       const ordenExist = await  Ordenes.findByPk(id_);

       //si no exixte crear la
       if(!ordenExist) {
        console.log('_____________ no existe la consulta 1________');
        const orden = req.body;
        orden.usuarioId = req.body.usuarioId;
        orden.id = id_;
       // orden.id = uuid();
        orden.activo = 0;
        orden.descripcion = 'pago '+ req.body.titulo;
        await Ordenes.create(orden);
        //si existe la orden trare los datos a mostrar
        const consulta = await Ordenes.findOne({ 
            where : {
                usuarioId : req.body.usuarioId          
            }, 
            include : [
                { 
                    model: Usuarios
                }
            ]
        });
        const epayco_key = await Meeti.findAll({
            where: { id : consulta.meetiId}    
            });

        // Si no existe
       if(!consulta) {
        console.log('_____________ no existe la consulta________');
      }
     
        res.send({data:consulta,llave:epayco_key});
      }else{
        //si existe la orden trare los datos a mostrar
            const consulta = await Ordenes.findOne({ 
                where : {
                    usuarioId : req.body.usuarioId          
                }, 
                include : [
                    { 
                        model: Usuarios
                    }
                ]
            });
            const epayco_key = await Meeti.findAll({
                where: { id : consulta.meetiId}    
                });
            // Si no existe
           if(!consulta) {
            console.log('_____________ no existe la consulta________');
          }
          var epaycoKey= {};
          for (var key in epayco_key) {
            epaycoKey = epayco_key[key];
       }

          res.send({data:consulta,llave:epayco_key});
        }
           
       // }
    } catch (error) {
        console.log('============== error=================',error);
        if(error.errors){  
           
            console.log('============== error.erros=================',error.parent.detail);
         req.flash('error',error.parent.detail);
          }
          res.redirect('/administracion');
    }

    
};

// muestra el listado de asistentes
exports.mostrarAsistentes = async (req, res) => {
    const meeti = await Meeti.findOne({
                                    where: { slug : req.params.slug },
                                    attributes: ['interesados']
    });

    // extraer interesados
    const { interesados } = meeti;

    const asistentes = await Usuarios.findAll({
        attributes: ['nombre', 'imagen'],
        where : { id : interesados }
    });

    // crear la vista y pasar datos
    res.render('asistentes-meeti', {
        nombrePagina : 'Listado Asistentes Meeti',
        asistentes
    })
}


// Muestra los meetis agrupados por categoria

exports.mostrarCategoria = async (req, res, next) => {
    const categoria = await Categorias.findOne({ 
                                    attributes: ['id', 'nombre'],
                                    where: { slug : req.params.categoria}
    });
    const meetis = await Meeti.findAll({
                                    order: [
                                        ['fecha', 'ASC'], 
                                        ['hora', 'ASC']
                                    ],
                                    include: [
                                        {
                                            model: Grupos,
                                            where : { categoriaId : categoria.id}
                                        }, 
                                        {
                                            model : Usuarios
                                        }
                                    ]
    });

    res.render('categoria', {
        nombrePagina : `Categoria: ${categoria.nombre}`,
        meetis,
        moment
    })

    console.log(categoria.id);
}