const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const e = require('express');
const PORT = process.env.PORT || 3050;

const app = express();
app.use(bodyParser.json());

var connection = mysql.createConnection({
    host:"localhost",
    database:"sip_2",
    user:"root",
    password:"root"
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


app.get('/', (req, res) =>{
    res.send("Welcome to the api!!")
})

app.get('/patologias', (req, res) =>{
    const sql = "SELECT * FROM patologias";
    connection.query(sql,(errors, results) => {
        if(errors) throw errors;
        if(results != undefined && results.length > 0){
            res.json(results)
        } else {
            res.json({})
        }
    })
})

app.get('/patologias/:id', (req, res) =>{
    res.send("Get patologia by ID")
})

app.post('/patologias', (req, res) =>{
    const sql = "INSERT INTO patologias SET ?"
    const newPatologia = {
        descripcion: req.body.nuevaDescripcion
    }
    connection.query(sql,newPatologia, (error) => {
        if(error) throw error;
        res.send("Patologia creada!!")
    })
})

app.put('/patologias/:id', (req, res) =>{
    const {id} = req.params;
    const {descripcion} = req.body;
    const sql = `UPDATE patologias SET descripcion = '${descripcion}' WHERE id_patologia=${id}`

    connection.query(sql, (error) => {
        if(error) throw error;
        res.send("Patologia actualizada!!")
    })
})

app.delete('/patologias/:id', (req, res) =>{
    const {id} = req.params;
    const sql = `DELETE FROM patologias WHERE id_patologia=${id}`

    connection.query(sql, (error) => {
        if(error) throw error;
        res.send("Patologia eliminada!!")
    })
})

//productos
app.get('/productos', (req, res) =>{
    const sql = "SELECT * FROM productos ORDER BY descripcion";
    connection.query(sql,(errors, results) => {
        if(errors) throw errors;
        if(results != undefined && results.length > 0){
            res.json(results)
        } else {
            res.json([])
        }
    })
})

app.get('/productos/:id', (req, res) =>{
    res.send("Get patologia by ID")
})

app.post('/productos', (req, res) =>{
    const sql = "INSERT INTO productos SET ?"
    const newProducto = {
        descripcion: req.body.descripcion,
        hc: req.body.hc,
        kcal: req.body.kcal,
        apto_celiaco: req.body.aptoCeliaco,
        apto_diabetico: req.body.aptoDiabetico
    }
    connection.query(sql,newProducto, (error) => {
        if(error) throw error;
        res.send("Producto creado!!")
    })
})

app.put('/productos/:id', (req, res) =>{
    // const {id} = req.params;
    // const {descripcion} = req.body;
    // const sql = `UPDATE patologias SET descripcion = '${descripcion}' WHERE id_patologia=${id}`

    // connection.query(sql, (error) => {
    //     if(error) throw error;
    //     res.send("Patologia actualizada!!")
    // })
    res.send("Método no implementado")
})

app.delete('/productos/:id', (req, res) =>{
    const {id} = req.params;
    const sql = `DELETE FROM productos WHERE id_producto=${id}`

    connection.query(sql, (error) => {
        if(error) throw error;
        res.send("Producto eliminada!!")
    })
})

//recetas
app.get('/recetas', (req, res) =>{
    const sql = "SELECT * FROM recetas";
    connection.query(sql,(errors, results) => {
        if(errors) throw errors;
        if(results != undefined && results.length > 0){
            res.json(results)
        } else {
            res.json([])
        }
    })
})

app.get('/recetas/:id', (req, res) =>{
    res.send("Get receta by ID")
})

app.post('/recetas', (req, res) =>{
    const sql = "INSERT INTO recetas SET ?"
    const newReceta = {
        descripcion: req.body.descripcion,
        preparacion: req.body.preparacion,
        rendimiento: req.body.rendimiento,
        total_hc: req.body.hc,
        total_kcal: req.body.kcal,
        apto_celiaco: req.body.aptoCeliaco,
        apto_diabetico: req.body.aptoDiabetico
    }

    connection.query(sql,newReceta, (error, resultReceta) => {
        if(error) throw error;
        if(req.body.ingredientes != undefined && req.body.ingredientes.length > 0){
            let newRecetaId = resultReceta.insertId 
            const sqlIngredientes = "INSERT INTO ingredientes SET ?"
            req.body.ingredientes.forEach(function(e){
                let newIngrediente = {
                    id_receta: newRecetaId,
                    id_producto: e.id_producto,
                    cantidad: e.cantidad,
                }

                connection.query(sqlIngredientes,newIngrediente, (error, result) => {
                    if(error) throw error;
                    console.log("ingrediente agregado!!", result.insertId)
                })
            })
            
        }
    })

    res.send("Receta creada!!")

})

app.put('/recetas/:id', (req, res) =>{
    // const {id} = req.params;
    // const {descripcion} = req.body;
    // const sql = `UPDATE patologias SET descripcion = '${descripcion}' WHERE id_patologia=${id}`

    // connection.query(sql, (error) => {
    //     if(error) throw error;
    //     res.send("Patologia actualizada!!")
    // })
    res.send("Método no implementado")
})

app.delete('/recetas/:id', (req, res) =>{
    const {id} = req.params;
    const sql = `DELETE FROM recetas WHERE id_receta=${id}`

    connection.query(sql, (error) => {
        if(error) throw error;
        res.send("Receta eliminada!!")
    })
})

//plan semanal
app.get('/plan',(req,res) =>{
    let aptoCeliaco = false;
    let aptoDiabetico = false
    let aptoObesidad = false;

    if(req.query.aptoCeliaco != undefined){
        if(req.query.aptoCeliaco == 'true'){
            aptoCeliaco = true
        }
    }

    if(req.query.aptoDiabetico != undefined){
        if(req.query.aptoDiabetico == 'true'){
            aptoDiabetico = true
        }
    } 

    if(req.query.aptoObesidad != undefined){
        if(req.query.aptoObesidad == 'true'){
            aptoObesidad = true
        }
    }

    console.log(`Plan dietario params: aptoCeliaco: ${aptoCeliaco}; aptoDiabetico: ${aptoDiabetico}; aptoObesidad: ${aptoObesidad};`)

    let sqlRecetas = ""
    let sqlColaciones = ""
    let sqlBebidas = ""

    if(aptoCeliaco && aptoDiabetico){
        sqlRecetas = `SELECT * FROM recetas WHERE apto_celiaco=${aptoCeliaco} AND apto_diabetico=${aptoDiabetico}`
        sqlBebidas = `SELECT * FROM bebidas WHERE apto_celiaco=${aptoCeliaco} AND apto_diabetico=${aptoDiabetico}`
        sqlColaciones = `SELECT * FROM productos WHERE colacion=true AND apto_celiaco=${aptoCeliaco} AND apto_diabetico=${aptoDiabetico}`
    } else {
        if(aptoCeliaco){
            sqlRecetas = `SELECT * FROM recetas WHERE apto_celiaco=${aptoCeliaco}`
            sqlBebidas = `SELECT * FROM bebidas WHERE apto_celiaco=${aptoCeliaco}`
            sqlColaciones = `SELECT * FROM productos WHERE apto_celiaco=${aptoCeliaco} AND colacion=true`
        } else{
            if(aptoDiabetico){
                sqlRecetas = `SELECT * FROM recetas WHERE apto_diabetico=${aptoDiabetico}`
                sqlBebidas = `SELECT * FROM bebidas WHERE apto_diabetico=${aptoDiabetico}`
                sqlColaciones = `SELECT * FROM productos WHERE apto_diabetico=${aptoDiabetico} AND colacion=true`
            } else {
                if(aptoObesidad){
                    sqlRecetas = `SELECT * FROM recetas`
                    sqlBebidas = `SELECT * FROM bebidas`
                    sqlColaciones = `SELECT * FROM productos WHERE colacion=true`
                }
            }
        }
    } 
    
    let bebidasDesayunoMeriendas = [];
    let bebidasAlmuerzoCenas = [];
    let colaciones = [];
    console.log("Query bebidas:",sqlBebidas)
    console.log("Query colaciones:",sqlColaciones)
    console.log("Query recetas:",sqlRecetas)

    if(sqlBebidas != "" && sqlColaciones != "" && sqlRecetas != ""){
        connection.query(sqlBebidas,(error, results) =>{
            if(error) throw error;
            if(results != undefined && results.length > 0){
                bebidasDesayunoMeriendas = results.filter((e) => e.tipo === "Desayuno/Merienda")
                bebidasAlmuerzoCenas = results.filter((e) => e.tipo === "Almuerzo/Cena")
            }
        })
    
        connection.query(sqlColaciones,(error, results) =>{
            colaciones = results
        }) 
    
        connection.query(sqlRecetas,(error, results) =>{
            const maxKcalDiarios = 2000
            const maxHcDiarios = 200
            const maxHcComida = 33
     
            const maxKcalDesayuno = 400
            const maxKcalColacion = 200
            const maxKcalAlmuerzo = 600
            //DESCOMENTAR CUANDO HAYA MAS OPCIONES DE MERIENDAS CON MENOS DE 200K o SUBIR a 2500KCAL
            // const maxKcalMerienda = 200
            const maxKcalMerienda = 300
            const maxKcalCena = 600
    
     
    
            //TODO: 
            //Ver opciones de postre.
            //En caso de resto, sumar una porción más de almuerzo/cena
    
            if(error) throw error;
    
            if(results != undefined && results.length > 0){
                let desayunosMeriendas = results.filter((e) => e.tipo === 'Desayuno/Merienda')
                let almuerzosCenas = results.filter((e) => e.tipo === 'Almuerzo/Cena')
    
                //Desayuno (Celiaco: Max 250kcal c/u)
                let desayuno = {
                    id:0,
                    type:"Desayuno",
                    maxKcal: maxKcalDesayuno,
                    kcal: 0,
                    hc: 0,
                    receta:{
                        descripcion:"",
                        cantidades:0,
                        url_imagen:""
                    },
                    bebida:{
                        descripcion:"",
                        cantidades:1
                    },
                }
    
                //Estrategia en las comidas:
                // Primero se elige una receta.
                // Luego una bebida
                // Si queda resto de calorias, se elige otra porción de la misma receta
                let desayunoIdx = -1
                while(desayuno.kcal === 0){
                    desayunoIdx = Math.floor(Math.random()*desayunosMeriendas.length)
                    let desayunoElegido = desayunosMeriendas[desayunoIdx]
                    let kcalPorCantidad = (desayunoElegido.total_kcal / desayunoElegido.rendimiento)
                    let hcPorCantidad = (desayunoElegido.total_hc / desayunoElegido.rendimiento)
    
                    if(kcalPorCantidad < maxKcalDesayuno){
                        let elegirComida = false
                        if(aptoDiabetico){
                            if(hcPorCantidad < maxHcComida){
                                elegirComida = true
                            }
                        } else {
                            elegirComida = true
                        }
    
                        if(elegirComida){
                            desayuno.receta.descripcion = desayunoElegido.descripcion
                            desayuno.kcal += kcalPorCantidad
                            desayuno.receta.cantidades++
                            desayuno.receta.url_imagen = desayunoElegido.url_imagen
                            desayuno.hc += (desayunoElegido.total_hc / desayunoElegido.rendimiento)
            
                            let bebidaIdx = Math.floor(Math.random()*bebidasDesayunoMeriendas.length)
                            let bebida = bebidasDesayunoMeriendas[bebidaIdx]
                            desayuno.bebida.descripcion = bebida.descripcion
                            desayuno.kcal += bebida.kcal
    
                            let elegirOtraPorcion = false
                            if((desayuno.kcal + kcalPorCantidad) < maxKcalDesayuno){
                                if(aptoDiabetico){
                                    if(desayuno.hc + hcPorCantidad < maxHcComida){
                                        elegirOtraPorcion = true
                                    }                                
                                } else {
                                    elegirOtraPorcion = true
                                }
                            }
            
                            while(elegirOtraPorcion){
                                elegirOtraPorcion = false
                                desayuno.kcal += kcalPorCantidad
                                desayuno.hc += hcPorCantidad
                                desayuno.receta.cantidades++
    
                                if((desayuno.kcal + kcalPorCantidad) < maxKcalDesayuno){
                                    if(aptoDiabetico){
                                        if(desayuno.hc + hcPorCantidad < maxHcComida){
                                            elegirOtraPorcion = true
                                        }                                
                                    } else{
                                        elegirOtraPorcion = true
                                    }
                                }
                            }
                        }
                    }
                }
                desayunosMeriendas.splice(desayunoIdx,1)
    
                //Colación
                let colacion = {
                    id:1,
                    type:"Colación",
                    kcal:0,
                    hc: 0,
                    maxKcal: maxKcalColacion,
                    receta:{
                        descripcion:"",
                        cantidades:0,
                    },
                    bebida:{
                        descripcion:"",
                        cantidades: 1
                    }
                }
                let colacionIdx = -1
                while(colacion.kcal === 0){
                    colacionIdx = Math.floor(Math.random()*colaciones.length)
                    let colacionElegido = colaciones[colacionIdx]
                    kcalPorCantidad = colacionElegido.kcal * colacionElegido.gr_unidad_media /100
    
                    if(kcalPorCantidad < maxKcalColacion){
                        let elegirComida = false
                        if(aptoDiabetico){
                            if(colacionElegido.hc < maxHcComida){
                                elegirComida = true
                            }
                        } else {
                            elegirComida = true
                        }
                        if(elegirComida){
                            colacion.receta.descripcion = colacionElegido.descripcion;
                            colacion.kcal += kcalPorCantidad
                            colacion.receta.url_imagen = colacionElegido.url_imagen
                            colacion.receta.cantidades++
                            colacion.hc += (colacionElegido.hc * colacionElegido.gr_unidad_media /100)
            
                            let bebidaIdx = Math.floor(Math.random()*bebidasDesayunoMeriendas.length)
                            let bebida = bebidasDesayunoMeriendas[bebidaIdx]
                            colacion.bebida.descripcion = bebida.descripcion
                            colacion.kcal += bebida.kcal
    
                            let elegirOtraPorcion = false
                            if((colacion.kcal + kcalPorCantidad) < maxKcalColacion){
                                if(aptoDiabetico){
                                    if(colacion.hc + colacionElegido.hc < maxHcComida){
                                        elegirOtraPorcion = true
                                    }                                
                                }
                            }
            
                            while(elegirOtraPorcion){
                                elegirOtraPorcion = false
                                colacion.kcal += kcalPorCantidad
                                if(aptoDiabetico){
                                    colacion.hc += (colacionElegido.hc * colacionElegido.gr_unidad_media /100)
                                }
                                colacion.receta.cantidades++
    
                                if((colacion.kcal + kcalPorCantidad) < maxKcalColacion){
                                    if(aptoDiabetico){
                                        if(colacion.hc + colacionElegido.hc < maxHcComida){
                                            elegirOtraPorcion = true
                                        }                                
                                    } else {
                                        elegirOtraPorcion = true
                                    }
                                }
                            }
                        }
                    }
                }
    
                //Almuerzo
                let almuerzo = {
                    id:1,
                    type:"Almuerzo",
                    kcal:0,
                    hc: 0,
                    maxKcal: maxKcalAlmuerzo,
                    receta:{
                        descripcion:"",
                        cantidades:0,
                        url_imagen:""
                    },
                    bebida:{
                        descripcion:"",
                        cantidades: 1
                    }
                }
                let almuerzoIdx = -1
                while(almuerzo.kcal === 0){
                    almuerzoIdx = Math.floor(Math.random()*almuerzosCenas.length)
                    let almuerzoElegido = almuerzosCenas[almuerzoIdx]
                    kcalPorCantidad = (almuerzoElegido.total_kcal / almuerzoElegido.rendimiento)
                    let hcPorCantidad = (almuerzoElegido.total_hc / almuerzoElegido.rendimiento)
    
                    if(kcalPorCantidad < maxKcalAlmuerzo){
                        let elegirComida = false
                        if(aptoDiabetico){
                            let hcPorCantidad = (almuerzoElegido.total_hc / almuerzoElegido.rendimiento)
                            if(hcPorCantidad < maxHcComida){
                                elegirComida = true
                            }
                        } else {
                            elegirComida = true
                        }
    
                        if(elegirComida){
                            almuerzo.receta.descripcion = almuerzoElegido.descripcion;
                            almuerzo.kcal += kcalPorCantidad
                            almuerzo.receta.cantidades++
                            almuerzo.receta.url_imagen = almuerzoElegido.url_imagen
                            almuerzo.hc += (almuerzoElegido.total_hc / almuerzoElegido.rendimiento)
            
                            let bebidaIdx = Math.floor(Math.random()*bebidasAlmuerzoCenas.length)
                            let bebida = bebidasAlmuerzoCenas[bebidaIdx]
                            almuerzo.bebida.descripcion = bebida.descripcion
                            almuerzo.kcal += bebida.kcal
    
                            let elegirOtraPorcion = false
                            if((almuerzo.kcal + kcalPorCantidad) < maxKcalAlmuerzo){
                                if(aptoDiabetico){
                                    if(almuerzo.hc + hcPorCantidad < maxHcComida){
                                        elegirOtraPorcion = true
                                    }                                
                                } else{
                                    elegirOtraPorcion = true
                                }
                            }
            
                            while(elegirOtraPorcion){
                                elegirOtraPorcion = false
                                almuerzo.kcal += kcalPorCantidad
                                almuerzo.hc += (almuerzoElegido.total_hc / almuerzoElegido.rendimiento)
                                almuerzo.receta.cantidades++
    
                                if((almuerzo.kcal + kcalPorCantidad) < maxKcalAlmuerzo){
                                    if(aptoDiabetico){
                                        if(almuerzo.hc + hcPorCantidad < maxHcComida){
                                            elegirOtraPorcion = true
                                        }                                
                                    } else {
                                        elegirOtraPorcion = true
                                    }
                                }
                            }
                        }
                    }
                }
                almuerzosCenas.splice(almuerzoIdx,1)
    
                //Merienda
                let merienda = {
                    id:2,
                    type:"Merienda",
                    kcal:0,
                    hc: 0,
                    maxKcal: maxKcalMerienda,
                    receta:{
                        descripcion:"",
                        cantidades:0,
                        url_imagen:""
                    },
                    bebida:{
                        descripcion:"",
                        cantidades:1
                    }
                }
                let meriendaIdx = -1;
                while(merienda.kcal === 0){
                    meriendaIdx = Math.floor(Math.random()*desayunosMeriendas.length)
                    let meriendaElegida = desayunosMeriendas[meriendaIdx]
                    kcalPorCantidad = (meriendaElegida.total_kcal / meriendaElegida.rendimiento)
                    let hcPorCantidad = (meriendaElegida.total_hc / meriendaElegida.rendimiento)
    
                    if(kcalPorCantidad < maxKcalMerienda){
                        let elegirComida = false
                        if(aptoDiabetico){
                            let hcPorCantidad = (meriendaElegida.total_hc / meriendaElegida.rendimiento)
                            if(hcPorCantidad < maxHcComida){
                                elegirComida = true
                            }
                        } else {
                            elegirComida = true
                        }
    
                        if(elegirComida){
                            merienda.receta.descripcion = meriendaElegida.descripcion;
                            merienda.kcal += kcalPorCantidad
                            merienda.receta.cantidades++
                            merienda.receta.url_imagen = meriendaElegida.url_imagen
                            merienda.hc += (meriendaElegida.total_hc / meriendaElegida.rendimiento)
            
                            let bebidaIdx = Math.floor(Math.random()*bebidasDesayunoMeriendas.length)
                            let bebida = bebidasDesayunoMeriendas[bebidaIdx]
                            merienda.bebida.descripcion = bebida.descripcion
                            merienda.kcal += bebida.kcal
    
                            let elegirOtraPorcion = false
                            if((almuerzo.kcal + kcalPorCantidad) < maxKcalMerienda){
                                if(aptoDiabetico){
                                    if(almuerzo.hc + hcPorCantidad < maxHcComida){
                                        elegirOtraPorcion = true
                                    }                                
                                }
                            }
            
                            while(elegirOtraPorcion){
                                elegirOtraPorcion = false
                                merienda.kcal += kcalPorCantidad
                                merienda.hc += (meriendaElegida.total_hc / meriendaElegida.rendimiento)
                                merienda.receta.cantidades++
    
                                if((almuerzo.kcal + kcalPorCantidad) < maxKcalMerienda){
                                    if(aptoDiabetico){
                                        if(almuerzo.hc + hcPorCantidad < maxHcComida){
                                            elegirOtraPorcion = true
                                        }                                
                                    } else {
                                        elegirOtraPorcion = true
                                    }
                                }
                            }
                        }
                    }
                }
                desayunosMeriendas.splice(meriendaIdx,1)
    
                //Cena
                let cena = {
                    id:3,
                    type:"Cena",
                    kcal:0,
                    hc: 0,
                    maxKcal:maxKcalCena,
                    receta:{
                        descripcion:"",
                        cantidades:0,
                        url_imagen:""
                    },
                    bebida:{
                        descripcion:"",
                        cantidades:1
                    }
                }
                let cenaIdx = -1
                while(cena.kcal === 0){
                    cenaIdx = Math.floor(Math.random()*almuerzosCenas.length)
                    let cenaElegida = almuerzosCenas[cenaIdx]
                    kcalPorCantidad = (cenaElegida.total_kcal / cenaElegida.rendimiento)
                    let hcPorCantidad = (cenaElegida.total_hc / cenaElegida.rendimiento)
    
                    if(kcalPorCantidad < maxKcalCena){
                        let elegirComida = false
                        if(aptoDiabetico){
                            let hcPorCantidad = (cenaElegida.total_hc / cenaElegida.rendimiento)
                            if(hcPorCantidad < maxHcComida){
                                elegirComida = true
                            }
                        } else {
                            elegirComida = true
                        }
    
                        if(elegirComida){
                            cena.receta.descripcion = cenaElegida.descripcion;
                            cena.kcal += kcalPorCantidad
                            cena.receta.cantidades++
                            cena.receta.url_imagen = cenaElegida.url_imagen
                            cena.hc += (cenaElegida.total_hc / cenaElegida.rendimiento)
            
                            let bebidaIdx = Math.floor(Math.random()*bebidasAlmuerzoCenas.length)
                            let bebida = bebidasAlmuerzoCenas[bebidaIdx]
                            cena.bebida.descripcion = bebida.descripcion
                            cena.kcal += bebida.kcal
    
                            let elegirOtraPorcion = false
                            if((cena.kcal + kcalPorCantidad) < maxKcalCena){
                                if(aptoDiabetico){
                                    if(cena.hc + hcPorCantidad < maxHcComida){
                                        elegirOtraPorcion = true
                                    }                                
                                } else {
                                    elegirOtraPorcion = true
                                }
                            }
            
                            while(elegirOtraPorcion){
                                elegirOtraPorcion = false
                                cena.kcal += kcalPorCantidad
                                cena.hc += (cenaElegida.total_hc / cenaElegida.rendimiento)
                                cena.receta.cantidades++
    
                                if((cena.kcal + kcalPorCantidad) < maxKcalCena){
                                    if(aptoDiabetico){
                                        if(cena.hc + hcPorCantidad < maxHcComida){
                                            elegirOtraPorcion = true
                                        }                                
                                    } else {
                                        elegirOtraPorcion = true
                                    }
                                }
                            }
                        }
                    }
                    
                }
                almuerzosCenas.splice(cenaIdx,1) 
            
                let plan = [
                    desayuno,
                    colacion,
                    almuerzo,
                    merienda,
                    cena
                ]
                console.log(plan)
                res.send(plan)
            } else { 
                res.send([])
            }
            
        })
    } else {
        res.send([])
    }

})



connection.connect(function(error){
    if(error){
        throw error
    } else{
        console.log("conexión exitosa")
    }
})


app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
})

// connection.end();