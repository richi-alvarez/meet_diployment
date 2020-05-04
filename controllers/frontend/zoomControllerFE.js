const Ordenes = require('../../models/Ordenes');
const Usuarios = require('../../models/Usuarios');
const Meeti = require('../../models/Meeti');

exports.mostrarMeeti = async function(req, res, next){
    const id_ = req.params.id;

    const ordenes = await Ordenes.findAll({
        where: { id : id_ , usuarioId : req.user.id},
        include : [
            { 
                model : Usuarios,
                attributes : ['id', 'nombre', 'imagen']
            }
        ]
})
console.log('----------',ordenes.length)
if(ordenes.length<=0){
    console.log('----2------',id_,req.user.id)
    var userCount=true;
    console.log(userCount)
    var meeti = await Meeti.findOne({ where : { id: id_, usuarioId : req.user.id }});
    if(!meeti) {
        req.flash('error', 'No se encontro la reunion');
        res.redirect('/administracion');
        return next();
        }
        res.render('zoom',{
            nombrePagina : 'zoom',
            userCount,
            meeti
        });

}else{
    var orden_ = {};
    for (var key in ordenes) {
        orden_ = ordenes[key];
    }
    if(orden_.activo === 1)
    {
        var meeti = await Meeti.findOne({ 
            where : {
                id : orden_.meetiId        
            }
        });
        var userCount=false;
        
        try {
            // if(orden_.usuarioId===req.user.id){
            //     userCount = true;
            // }
            console.log(userCount)
            res.render('zoom',{
                nombrePagina : 'zoom',
                userCount,
                meeti
            });
             
        } catch (error) {
            console.log("lllllllllllllllll",error)
            req.flash('error', 'error inespedado, por favor contacte con soporte');
            res.redirect('/administracion');
        }
        //res.send({ordenes})
     
    }else{
        
         req.flash('error', 'No se ha pagado la  reunion');
        res.redirect('/administracion');
        return next();
    }
}

   



        }