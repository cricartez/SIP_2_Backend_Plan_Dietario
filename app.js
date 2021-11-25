const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3050;

const planesDietarioUtils = require('./src/planes_dietarios');
const e = require('express');

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

//plan diario
app.get('/generate_plan_diario',(req,res) =>{
    let aptoCeliaco = false;
    let aptoDiabetico = false
    let aptoDiabetico1 = false
    let aptoDiabetico2 = false
    let aptoObesidad = false;

    if(req.query.aptoCeliaco != undefined){
        if(req.query.aptoCeliaco == 'true'){
            aptoCeliaco = true
        }
    }

    if(req.query.aptoDiabetico1 != undefined){
        if(req.query.aptoDiabetico1 == 'true'){
            aptoDiabetico1 = true
        }
    }

    if(req.query.aptoDiabetico2 != undefined){
        if(req.query.aptoDiabetico2 == 'true'){
            aptoDiabetico2 = true
        }
    }

    if(req.query.aptoObesidad != undefined){
        if(req.query.aptoObesidad == 'true'){
            aptoObesidad = true
        }
    }

    aptoDiabetico = aptoDiabetico1 || aptoDiabetico2

    console.log(`Plan dietario params: aptoCeliaco: ${aptoCeliaco}; aptoDiabetico: ${aptoDiabetico}; aptoObesidad: ${aptoObesidad};`)

    let sqlRecetas = ""
    let sqlColaciones = ""
    let sqlBebidas = ""
    let sqlInfoNutricional = "SELECT * FROM infonutricional"
    let sqlProductosGramosUnidad = "SELECT * FROM productos_gramos_x_unidad"

    if(aptoCeliaco && aptoDiabetico){
        sqlRecetas = `SELECT * FROM platos WHERE Celiquia=${aptoCeliaco} AND Tipo1=${aptoDiabetico}`
        sqlBebidas = `SELECT * FROM productos WHERE Celiquia=${aptoCeliaco} AND Tipo1=${aptoDiabetico} AND Tipo_Producto = 'Bebidas'`
        sqlColaciones = `SELECT * FROM productos WHERE Celiquia=${aptoCeliaco} AND Tipo1=${aptoDiabetico} AND Tipo_Comida = 'Colación'`
    } else {
        if(aptoCeliaco){
            sqlRecetas = `SELECT * FROM platos WHERE Celiquia=${aptoCeliaco}`
            sqlBebidas = `SELECT * FROM productos WHERE Tipo_Producto = 'Bebidas' AND Celiquia=${aptoCeliaco}`
            sqlColaciones = `SELECT * FROM productos WHERE Celiquia=${aptoCeliaco} AND Tipo_Comida='Colación'`
        } else{
            if(aptoDiabetico){
                sqlRecetas = `SELECT * FROM platos WHERE Tipo1=${aptoDiabetico}`
                sqlBebidas = `SELECT * FROM productos WHERE Tipo1=${aptoDiabetico} AND Tipo_Producto = 'Bebidas'`
                sqlColaciones = `SELECT * FROM productos WHERE Tipo1=${aptoDiabetico} AND Tipo_Comida='Colación'`
            } else {
                if(aptoObesidad){
                    sqlRecetas = `SELECT * FROM platos`
                    sqlBebidas = `SELECT * FROM productos WHERE Tipo_Producto = 'Bebidas'`
                    sqlColaciones = `SELECT * FROM productos WHERE Tipo_Comida='Colación'`
                }
            }
        }
    } 
    
    let bebidasDesayunoMeriendas = [];
    let bebidasAlmuerzoCenas = [];
    let colaciones = [];
    let informacionNutricional = [];
    let gramosUnidadProducto = [];
    console.log("Query bebidas:",sqlBebidas)
    console.log("Query colaciones:",sqlColaciones)
    console.log("Query recetas:",sqlRecetas)

    if(sqlBebidas != "" && sqlColaciones != "" && sqlRecetas != ""){
        connection.query(sqlInfoNutricional,(error, results) =>{
            if(error) throw error;
            if(results != undefined && results.length > 0){
                informacionNutricional = results
            }
        })

        connection.query(sqlProductosGramosUnidad,(error, results) =>{
            if(error) throw error;
            if(results != undefined && results.length > 0){
                gramosUnidadProducto = results
            }
        })

        connection.query(sqlBebidas,(error, results) =>{
            if(error) throw error;
            if(results != undefined && results.length > 0){
                bebidasDesayunoMeriendas = results.filter((e) => e.Tipo_Comida === "Desayuno/Merienda")
                bebidasAlmuerzoCenas = results.filter((e) => e.Tipo_Comida === "Almuerzo/Cena")
            }
        })
        connection.query(sqlColaciones,(error, results) =>{
            colaciones = results
        }) 
    
        connection.query(sqlRecetas,(error, results) =>{
            //TODO: 
            //Ver opciones de postre.
            //En caso de resto, sumar una porción más de almuerzo/cena
    
            if(error) throw error;
            let plan = planesDietarioUtils.getPlanDietarioDiario(aptoObesidad, aptoDiabetico, aptoCeliaco, results, colaciones, bebidasDesayunoMeriendas, bebidasAlmuerzoCenas, informacionNutricional, gramosUnidadProducto)
            res.send(plan)
        })
    } else {
        res.send([])
    }

})

//plan semanal
app.get('/generate_plan_semanal',  (req,res) => {
    let aptoCeliaco = false;
    let aptoDiabetico = false
    let aptoDiabetico1 = false
    let aptoDiabetico2 = false
    let aptoObesidad = false;

    if(req.query.aptoCeliaco != undefined){
        if(req.query.aptoCeliaco == 'true'){
            aptoCeliaco = true
        }
    }

    if(req.query.aptoDiabetico1 != undefined){
        if(req.query.aptoDiabetico1 == 'true'){
            aptoDiabetico1 = true
        }
    }

    if(req.query.aptoDiabetico2 != undefined){
        if(req.query.aptoDiabetico2 == 'true'){
            aptoDiabetico2 = true
        }
    }

    if(req.query.aptoObesidad != undefined){
        if(req.query.aptoObesidad == 'true'){
            aptoObesidad = true
        }
    }

    aptoDiabetico = aptoDiabetico1 || aptoDiabetico2

    console.log(`Plan dietario params: aptoCeliaco: ${aptoCeliaco}; aptoDiabetico: ${aptoDiabetico}; aptoObesidad: ${aptoObesidad};`)

    let sqlRecetas = ""
    let sqlColaciones = ""
    let sqlBebidas = ""
    let sqlInfoNutricional = "SELECT * FROM infonutricional"
    let sqlProductosGramosUnidad = "SELECT * FROM productos_gramos_x_unidad"

    if(aptoCeliaco && aptoDiabetico){
        sqlRecetas = `SELECT * FROM platos WHERE Celiquia=${aptoCeliaco} AND Tipo1=${aptoDiabetico}`
        sqlBebidas = `SELECT * FROM productos WHERE Celiquia=${aptoCeliaco} AND Tipo1=${aptoDiabetico} AND Tipo_Producto = 'Bebidas'`
        sqlColaciones = `SELECT * FROM productos WHERE Celiquia=${aptoCeliaco} AND Tipo1=${aptoDiabetico} AND Tipo_Comida = 'Colación'`
    } else {
        if(aptoCeliaco){
            sqlRecetas = `SELECT * FROM platos WHERE Celiquia=${aptoCeliaco}`
            sqlBebidas = `SELECT * FROM productos WHERE Tipo_Producto = 'Bebidas' AND Celiquia=${aptoCeliaco}`
            sqlColaciones = `SELECT * FROM productos WHERE Celiquia=${aptoCeliaco} AND Tipo_Comida='Colación'`
        } else{
            if(aptoDiabetico){
                sqlRecetas = `SELECT * FROM platos WHERE Tipo1=${aptoDiabetico}`
                sqlBebidas = `SELECT * FROM productos WHERE Tipo1=${aptoDiabetico} AND Tipo_Producto = 'Bebidas'`
                sqlColaciones = `SELECT * FROM productos WHERE Tipo1=${aptoDiabetico} AND Tipo_Comida='Colación'`
            } else {
                if(aptoObesidad){
                    sqlRecetas = `SELECT * FROM platos`
                    sqlBebidas = `SELECT * FROM productos WHERE Tipo_Producto = 'Bebidas'`
                    sqlColaciones = `SELECT * FROM productos WHERE Tipo_Comida='Colación'`
                }
            }
        }
    } 
    
    let bebidasDesayunoMeriendas = [];
    let bebidasAlmuerzoCenas = [];
    let colaciones = [];
    let informacionNutricional = [];
    let gramosUnidadProducto = [];
    console.log("Query bebidas:",sqlBebidas)
    console.log("Query colaciones:",sqlColaciones)
    console.log("Query recetas:",sqlRecetas)

    if(sqlBebidas != "" && sqlColaciones != "" && sqlRecetas != ""){
        connection.query(sqlInfoNutricional,(error, results) =>{
            if(error) throw error;
            if(results != undefined && results.length > 0){
                informacionNutricional = results
            }
        })

        connection.query(sqlProductosGramosUnidad,(error, results) =>{
            if(error) throw error;
            if(results != undefined && results.length > 0){
                gramosUnidadProducto = results
            }
        })

        connection.query(sqlBebidas,(error, results) =>{
            if(error) throw error;
            if(results != undefined && results.length > 0){
                bebidasDesayunoMeriendas = results.filter((e) => e.Tipo_Comida === "Desayuno/Merienda")
                bebidasAlmuerzoCenas = results.filter((e) => e.Tipo_Comida === "Almuerzo/Cena")
            }
        })
        connection.query(sqlColaciones,(error, results) =>{
            colaciones = results
        }) 
    
        connection.query(sqlRecetas,(error, results) =>{
            //TODO: 
            //Ver opciones de postre.
            //En caso de resto, sumar una porción más de almuerzo/cena
    
            if(error) throw error;
            let plan = planesDietarioUtils.getPlanDietarioSemanal(aptoObesidad, aptoDiabetico, aptoCeliaco, results, colaciones, bebidasDesayunoMeriendas, bebidasAlmuerzoCenas, informacionNutricional, gramosUnidadProducto)
            res.send(plan)
        })
    } else {
        res.send([])
    }
})

const getColacionComida = async function(resultPlan){
    return new Promise((resolve, reject) => {
        //Busco producto
        let sqlComidaProducto = `SELECT * FROM planes_diarios_comidas_productos WHERE id_plan_diario_comida = ${resultPlan.id_plan_diario_comida} AND tipo = 'Colación'` 
        connection.query(sqlComidaProducto, (error, resultComidaProducto) => {
            if(error) throw reject(error);
            resolve (resultComidaProducto[0])
        })
    }).then(function(result){
        return getProducto(result)
    })
}

const getExtraComida = async function(resultPlan){
    return new Promise((resolve, reject) => {
        //Busco producto
        let sqlComidaProducto = `SELECT * FROM planes_diarios_comidas_productos WHERE id_plan_diario_comida = ${resultPlan.id_plan_diario_comida} AND tipo = 'Extra'` 
        connection.query(sqlComidaProducto, (error, resultComidaProducto) => {
            if(error) throw reject(error);
            resolve (resultComidaProducto[0])
        })
    }).then(function(result){
        return getProducto(result)
    })
}

const getBebidaComida = async function(resultPlan){
    return new Promise((resolve, reject) => {
        //Busco producto
        let sqlComidaProducto = `SELECT * FROM planes_diarios_comidas_productos WHERE id_plan_diario_comida = ${resultPlan.id_plan_diario_comida} AND tipo = 'Bebida'` 
        connection.query(sqlComidaProducto, (error, resultComidaProducto) => {
            if(error) throw reject(error);
            resolve (resultComidaProducto[0])
        })
    }).then(function(result){
        return getProducto(result)
    })
}

const getProductoComida = async function(resultPlan){
    return new Promise((resolve, reject) => {
        //Busco producto
        let sqlComidaProducto = `SELECT * FROM planes_diarios_comidas_productos WHERE id_plan_diario_comida = ${resultPlan.id_plan_diario_comida}` 
        connection.query(sqlComidaProducto, (error, resultComidaProducto) => {
            if(error) throw reject(error);
            resolve (resultComidaProducto[0])
        })
    }).then(function(result){
        return getProducto(result)
    })
}

const getProducto = async function(resultComidaProducto){
    return new Promise((resolve, reject) => {
        let sqlProducto = `SELECT * FROM productos WHERE ID = ${resultComidaProducto.id_producto}`
        connection.query(sqlProducto, (error, resultProducto) => {
            if(error) throw reject(error);
            resolve({
                ...resultProducto[0],
                cantidades:resultComidaProducto.cantidad
            })
        })
    }).then(function(result){
        return getProductoInfoNutricional(result)
    })
}

const getProductoInfoNutricional = async function(result){
    return new Promise((resolve, reject) => {
        let sqlProducto = `SELECT * FROM infonutricional WHERE Producto = ${result.ID}`
        connection.query(sqlProducto, (error, resultInfoNutricional) => {
            if(error) throw reject(error);
            resolve({
                ...result,
                ...resultInfoNutricional[0],
                cantidades:result.cantidad,
                kcal: resultInfoNutricional.find((e) => e.Nombre == 'Kcal').Cantidad,
                hc: resultInfoNutricional.find((e) => e.Nombre == 'CH').Cantidad,
            })
        })
    })
}

const getRecetaComida = async function(resultPlan){
    return new Promise((resolve, reject) => {
        let sqlComidaReceta = `SELECT * FROM planes_diarios_comidas_recetas WHERE id_plan_diario_comida = ${resultPlan.id_plan_diario_comida}` 
        connection.query(sqlComidaReceta, (error, resultComidaReceta) => {
            if(error) throw reject(error);
            resolve(resultComidaReceta[0])
        })
    }).then(function(result){
        return getReceta(result);
    })
}

const getReceta = async function(resultComidaReceta){
    return new Promise((resolve, reject) => {
        let sqlReceta = `SELECT * FROM platos WHERE ID = ${resultComidaReceta.id_receta}`
        connection.query(sqlReceta, (error, resultReceta) => {
            if(error) throw reject(error);
            resolve({
                ...resultReceta[0],
                cantidades:resultComidaReceta.cantidad
            })
        })
    })
}


//get plan semanal
app.get('/plan_semanal', async (req, res) => {
    let idPlan = req.query.id_plan;
    let sqlPlan = `SELECT * FROM planes_semanales PS
    INNER JOIN planes_diarios PD ON PS.id_plan_semanal = PD.id_plan_semanal
    INNER JOIN planes_diarios_comidas PDC ON PDC.id_plan_diario = PD.id_plan_diario
    WHERE PS.id_plan_semanal = ${idPlan}`

    connection.query(sqlPlan, async (error, resultPlan) => {

        let result = [];
        let idx = 0;
        let currentDia = 0;

        while (idx < resultPlan.length - 1){
            result[currentDia] = []
            while (idx < resultPlan.length - 1 && resultPlan[idx].dia == currentDia){
                let receta = {};
                let bebida = {};
                let extra = {};
                if(resultPlan[idx].tipo != 'Colación'){
                    //Busco receta
                    let result = await getRecetaComida(resultPlan[idx])
                    console.log("rec", result)
                    receta.ID = result.ID,
                    receta.descripcion = result.Descripcion,
                    receta.url_imagen = result.Foto,
                    receta.kcal = result.Kcal,
                    receta.hc = result.CH,
                    receta.cantidades = result.cantidades

                    let bebidaResult = await getBebidaComida(resultPlan[idx]);
                    bebida.ID = bebidaResult.ID,
                    bebida.descripcion = bebidaResult.Descripcion,
                    bebida.url_imagen = bebidaResult.Foto,
                    bebida.kcal = bebidaResult.kcal,
                    bebida.hc = bebidaResult.hc,
                    bebida.cantidades = bebidaResult.cantidades
                } else {
                   let result = await getColacionComida(resultPlan[idx]);
                   receta.ID = result.ID,
                   receta.descripcion = result.Descripcion,
                   receta.url_imagen = result.Foto,
                   receta.kcal = result.kcal,
                   receta.hc = result.hc
                   receta.cantidades = result.cantidades

                   let bebidaResult = await getBebidaComida(resultPlan[idx]);
                    bebida.ID = bebidaResult.ID,
                    bebida.descripcion = bebidaResult.Descripcion,
                    bebida.url_imagen = bebidaResult.Foto,
                    bebida.kcal = bebidaResult.kcal,
                    bebida.hc = bebidaResult.hc,
                    bebida.cantidades = bebidaResult.cantidades
                }
                result[currentDia].push(
                    {
                        dia: currentDia,
                        type: resultPlan[idx].tipo,
                        kcal: resultPlan[idx].kcal,
                        hc: resultPlan[idx].hc,
                        receta: receta,
                        bebida: bebida,
                        extra: extra
                    }
                )
                idx = idx + 1
            }
            if(currentDia < 7){
                currentDia = currentDia + 1
            } else {
                currentDia = 0
            }
        }
        res.send(result)
    })
})

//save plan semanal
app.post('/plan_semanal',(req, res) => {
    let idUsuario = req.body.id_usuario;
    let planElegido = req.body.plan;

    let sqlPlanesSemanales = `INSERT INTO planes_semanales SET ?`
    const newPlanSemanal = {
        id_usuario: idUsuario,
        nombre: "myPlanSemanal"
    }

    connection.query(sqlPlanesSemanales,newPlanSemanal, (error, resultPlanSemanal) => {
        if(error) throw error;

        let idPlanSemanal = resultPlanSemanal.insertId

        planElegido.forEach((e, idx) => {
            let sqlPlanDiario = `INSERT INTO planes_diarios SET ?`
            const newPlanDiario = {
                id_plan_semanal: idPlanSemanal,
                dia: idx
            }

            connection.query(sqlPlanDiario, newPlanDiario, (error, resultPlanDiario) => {
                if(error) throw error;
                let idPlanDiario = resultPlanDiario.insertId;

                let sqlPlanDiarioComida = `INSERT INTO planes_diarios_comidas SET ?`
                e.forEach((c,idx) => {
                    const newComidaPlanDiario = {
                        id_plan_diario: idPlanDiario,
                        tipo: c.type,
                        kcal: c.kcal,
                        hc: c.hc
                    }
    
                    connection.query(sqlPlanDiarioComida, newComidaPlanDiario, (error, resultPlanDiario) => {
                        if(error) throw error;
                        let idComidaPlanDiario = resultPlanDiario.insertId;
                        
                        //Insert a Comida-Receta
                        if(c.type != 'Colación'){
                            let sqlComidaReceta = 'INSERT INTO planes_diarios_comidas_recetas SET ?'
                            const comidaReceta = {
                                id_plan_diario_comida: idComidaPlanDiario,
                                id_receta: c.receta.ID,
                                cantidad: c.receta.cantidades
                            }
                            connection.query(sqlComidaReceta, comidaReceta, (error, resultComidaReceta) => {
                            })
                        } else {
                            let sqlComidaProducto = 'INSERT INTO planes_diarios_comidas_productos SET ?'
                            const comidaProducto = {
                                id_plan_diario_comida: idComidaPlanDiario,
                                id_producto: c.receta.ID,
                                tipo:"Colación",
                                cantidad: c.receta.cantidades
                            }
                            connection.query(sqlComidaProducto, comidaProducto, (error, resultComidaReceta) => {
                            })
                        }

                        //Insert a Bebida Comida-Producto
                        if(c.bebida != undefined){
                            let sqlComidaProducto = 'INSERT INTO planes_diarios_comidas_productos SET ?'
                            const comidaProducto = {
                                id_plan_diario_comida: idComidaPlanDiario,
                                id_producto: c.bebida.ID,
                                tipo:"Bebida",
                                cantidad: c.bebida.cantidades
                            }
                            connection.query(sqlComidaProducto, comidaProducto, (error, resultComidaReceta) => {
                            })
                        }

                        if(c.extra.ID != undefined){
                            let sqlComidaProducto = 'INSERT INTO planes_diarios_comidas_productos SET ?'
                            const comidaProducto = {
                                id_plan_diario_comida: idComidaPlanDiario,
                                id_producto: c.extra.ID,
                                tipo:"Extra",
                                cantidad: c.extra.cantidades
                            }
                            connection.query(sqlComidaProducto, comidaProducto, (error, resultComidaReceta) => {
                            })
                        }
                    })
                })
            })
        })
    })
    
    res.send("faaa")
})

app.delete('/plan_semanal', (req, res) => {
    let idPlan = req.query.id_plan;

    let sqlDelete = `
    DELETE FROM sip_2.planes_diarios_comidas_recetas
    WHERE id_plan_diario_comida IN (SELECT PDC.id_plan_diario_comida FROM sip_2.planes_diarios_comidas PDC
    WHERE id_plan_diario IN (SELECT PD.id_plan_diario FROM sip_2.planes_semanales PS
    INNER JOIN sip_2.planes_diarios PD ON PS.id_plan_semanal = PD.id_plan_semanal
    WHERE PS.id_plan_semanal = ${idPlan}));`
    connection.query(sqlDelete, (error, result) => {
        if(error) throw error;
    })


    sqlDelete = `
    DELETE FROM sip_2.planes_diarios_comidas_productos
    WHERE id_plan_diario_comida IN (SELECT PDC.id_plan_diario_comida FROM sip_2.planes_diarios_comidas PDC
    WHERE id_plan_diario IN (SELECT PD.id_plan_diario FROM sip_2.planes_semanales PS
    INNER JOIN sip_2.planes_diarios PD ON PS.id_plan_semanal = PD.id_plan_semanal
    WHERE PS.id_plan_semanal = ${idPlan}));`
    connection.query(sqlDelete, (error, result) => {
        if(error) throw error;
    })

    sqlDelete = `
    DELETE FROM sip_2.planes_diarios_comidas PDC
    WHERE id_plan_diario IN (SELECT PD.id_plan_diario FROM sip_2.planes_semanales PS
    INNER JOIN sip_2.planes_diarios PD ON PS.id_plan_semanal = PD.id_plan_semanal
    WHERE PS.id_plan_semanal = ${idPlan})`
    connection.query(sqlDelete, (error, result) => {
        if(error) throw error;
    })

    sqlDelete = `
    DELETE FROM sip_2.planes_diarios_comidas PDC
    WHERE id_plan_diario IN (SELECT PD.id_plan_diario FROM sip_2.planes_semanales PS
    INNER JOIN sip_2.planes_diarios PD ON PS.id_plan_semanal = PD.id_plan_semanal
    WHERE PS.id_plan_semanal = ${idPlan})`
    connection.query(sqlDelete, (error, result) => {
        if(error) throw error;
    })

    sqlDelete = `DELETE FROM sip_2.planes_diarios PD
    WHERE PD.id_plan_semanal = ${idPlan};`
    connection.query(sqlDelete, (error, result) => {
        if(error) throw error;
    })

    sqlDelete = `DELETE FROM sip_2.planes_semanales PS
    WHERE PS.id_plan_semanal = ${idPlan};`
    connection.query(sqlDelete, (error, result) => {
        if(error) throw error;
    })

    res.send("Plan eliminado")

})

//my planes
app.get('/mis_planes', (req,res) => {
    let idUsuario = req.query.id_usuario;

    let sqlMyPlans = `SELECT * FROM planes_semanales WHERE id_usuario = ${idUsuario}`

    connection.query(sqlMyPlans, (error, resultMyPlans) => {
        if(error) throw error;
        console.log(resultMyPlans)
        res.send(resultMyPlans)
    })
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