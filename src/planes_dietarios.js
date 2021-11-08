let getPlanDietarioDiario = function(aptoObesidad, aptoDiabetico, aptoCeliaco, recetas, colaciones, bebidasDesayunoMeriendas, bebidasAlmuerzoCenas, informacionNutricional, gramosUnidadProducto){
    let plan = [];

    const desayunoPorcentaje = 0.2
    const colacionPorcentaje = 0.1
    const almuerzoPorcentaje = 0.3
    const meriendaPorcentaje = 0.1
    const cenaPorcentaje = 0.3

    let maxKcalDiarios = 2000
    let maxHcDiarios = 200

    if(aptoObesidad){
        maxKcalDiarios = 1700
    }

    //Cant. Carbs en una dieta de 2000kl diarios (1Carb = 4kcal):
    //Obesidad:             <10%    = 50g
    //Obesidad:             10%-25% = 50g-120g
    //Celiaquia/Normal:     25%-40% = 125g-200g
    //Otros/Más act.física: 40%-50% = 200g-250g 

    //Si es aptoObesidad, entonces se aplica la menor cantidad de carbs por dia
    if(aptoObesidad){
        //Ver si usar 50g y tener más opciones de MERIENDAS que está dando error, o mantener 90
        maxHcDiarios = 90
    } else {
        if(aptoDiabetico){
            maxHcDiarios = 125
        } else {
            if(aptoCeliaco){
                maxHcDiarios = 200
            }
        }
    }

    //Carbs por Comida
    const maxHcDesayuno = maxHcDiarios * desayunoPorcentaje
    const maxHcColacion = maxHcDiarios * colacionPorcentaje
    const maxHcAlmuerzo = maxHcDiarios * almuerzoPorcentaje
    const maxHcMerienda = maxHcDiarios * meriendaPorcentaje
    const maxHcCena = maxHcDiarios * cenaPorcentaje

    //Kcal por comida
    const maxKcalDesayuno = maxKcalDiarios * desayunoPorcentaje
    const maxKcalColacion = maxKcalDiarios * colacionPorcentaje
    const maxKcalAlmuerzo = maxKcalDiarios * almuerzoPorcentaje
    //DESCOMENTAR CUANDO HAYA MAS OPCIONES DE MERIENDAS CON MENOS DE 200K o SUBIR a 2500KCAL
    // const maxKcalMerienda = 200
    const maxKcalMerienda = maxKcalDiarios * meriendaPorcentaje
    const maxKcalCena = maxKcalDiarios * cenaPorcentaje

    if(recetas != undefined && recetas.length > 0){
        let desayunosMeriendas = recetas.filter((e) => e.Tipo_Comida === 'Desayuno/Merienda')
        let almuerzosCenas = recetas.filter((e) => e.Tipo_Comida === 'Almuerzo/Cena')

        /////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////// Desayuno //////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////
        let desayuno = {
            id:0,
            type:"Desayuno",
            maxKcal: maxKcalDesayuno,
            maxHC: maxHcDesayuno,
            kcal: 0,
            hc: 0,
            receta:{
                descripcion:"",
                cantidades:0,
                kcal_unidad:0,
                hc_unidad:0,
                url_imagen:""
            },
            bebida:{
                descripcion:"",
                cantidades:1,
                kcal_unidad:0,
                hc_unidad:0
            },
            extra:{
                descripcion:"",
                cantidades:0,
                kcal_unidad:0,
                hc_unidad:0
            }
        }

        //Estrategia en las comidas:
        // Primero se elige una receta.
        // Luego una bebida
        // Si queda resto de calorias, se elige otra porción de la misma receta
        let desayunoIdx = -1
        while(desayuno.kcal === 0){
            desayunoIdx = Math.floor(Math.random()*desayunosMeriendas.length)
            let desayunoElegido = desayunosMeriendas[desayunoIdx]
            let kcalPorCantidad = parseFloat(desayunoElegido.Kcal) / desayunoElegido.Rendimiento
            let hcPorCantidad = parseFloat(desayunoElegido.CH) / desayunoElegido.Rendimiento
            if(kcalPorCantidad < maxKcalDesayuno){
                let elegirComida = false
                if(aptoDiabetico){
                    if(hcPorCantidad < maxHcDesayuno){
                        elegirComida = true
                    }
                } else {
                    elegirComida = true
                }

                if(elegirComida){
                    desayuno.receta.ID = desayunoElegido.ID
                    desayuno.receta.descripcion = desayunoElegido.Descripcion
                    desayuno.receta.kcal_unidad = kcalPorCantidad
                    desayuno.receta.hc_unidad = hcPorCantidad
                    desayuno.kcal += kcalPorCantidad
                    desayuno.hc += hcPorCantidad
                    desayuno.receta.cantidades++
                    desayuno.receta.url_imagen = desayunoElegido.Foto

                    let bebidaIdx = Math.floor(Math.random()*bebidasDesayunoMeriendas.length)
                    let bebida = bebidasDesayunoMeriendas[bebidaIdx]
                    desayuno.bebida.ID = bebida.ID
                    desayuno.bebida.descripcion = bebida.Descripcion
                    desayuno.bebida.url_imagen = bebida.Foto
                    //Obtengo la información nutricional de la bebida elegida
                    let infoNutricional = informacionNutricional.filter((e) => e.Producto == bebida.ID)
                    if(infoNutricional != undefined){
                        let infoKcal = infoNutricional.find((e) => e.Nombre == 'Kcal')
                        let infoCH = infoNutricional.find((e) => e.Nombre == 'CH')
                        if(infoKcal != undefined) {
                            desayuno.bebida.kcal_unidad = parseFloat(infoKcal.Cantidad)
                            desayuno.kcal += parseFloat(infoKcal.Cantidad)
                        }

                        if(infoCH != undefined){
                            desayuno.bebida.hc_unidad = parseFloat(infoCH.Cantidad)
                            desayuno.hc += parseFloat(infoCH.Cantidad)
                        }
                    }

                    let elegirOtraPorcion = false
                    if((desayuno.kcal + kcalPorCantidad) < maxKcalDesayuno){
                        if(aptoDiabetico){
                            if(desayuno.hc + hcPorCantidad < maxHcDesayuno){
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
                                if(desayuno.hc + hcPorCantidad < maxHcDesayuno){
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

        //Si la cantidad de kcal o HC está por debajo de un 80%
        //elijo algo de colación para sumar más kcal/hc y completar mejor las cantidades diarias
        let elegirExtra = false
        if(desayuno.kcal*100/maxKcalDesayuno < 80){
            if(aptoDiabetico){
                if(desayuno.hc*100/maxHcDesayuno < 80){
                    elegirExtra = true
                }
            } else {
                elegirExtra = true
            }
        }

        //Mientras se siga cumpliendo que no se alcanza al menos el 80% o alguna otra condiciones, sigo agregando extra
        if(elegirExtra){
            elegirExtra = false
            let extraIdx = Math.floor(Math.random()*colaciones.length)
            let extraElegido = colaciones[extraIdx]
            let extraValido = false
            //Obtengo info de granularidad de extra elegido
            let gramosXProducto = gramosUnidadProducto.find((e) => e.Producto == extraElegido.ID)
            let kcalPorCantidadExtra = 0
            let hcPorCantidadExtra = 0

            if(gramosXProducto){
                kcalPorCantidadExtra = extraElegido.Kcal * gramosXProducto.gramos / 100
                hcPorCantidadExtra = extraElegido.HC * gramosXProducto.gramos / 100
            }

            if(desayuno.kcal + kcalPorCantidadExtra < maxKcalDesayuno){
                if(aptoDiabetico){
                    if(desayuno.hc + hcPorCantidadExtra < maxHcDesayuno){
                        extraValido = true
                    }
                }else{
                    extraValido = true
                }
            }

            //Elijo la colación extra
            if(extraValido){
                desayuno.extra.ID = extraElegido.ID
                desayuno.extra.descripcion = extraElegido.Descripcion
                desayuno.extra.kcal_unidad = kcalPorCantidadExtra
                desayuno.extra.hc_unidad = hcPorCantidadExtra

                while(extraValido){
                    extraValido = false
                    desayuno.extra.cantidades++
                    desayuno.kcal += kcalPorCantidadExtra
                    desayuno.hc += hcPorCantidadExtra

                    if(desayuno.kcal*100/maxKcalDesayuno < 80){
                        if(aptoDiabetico){
                            if(desayuno.hc*100/maxHcDesayuno < 80){
                                elegirExtra = true
                            }
                        } else {
                            elegirExtra = true
                        }
                    }

                    //Todavia se cumple la condición del 80%, 
                    //verifico si puedo elegir de nuevo otra porción de extra
                    if(elegirExtra){
                        if(desayuno.kcal + kcalPorCantidadExtra < maxKcalDesayuno){
                            if(aptoDiabetico){
                                if(desayuno.hc + hcPorCantidadExtra < maxHcDesayuno){
                                    extraValido = true
                                }
                            }else{
                                extraValido = true
                            }
                        }
                    }
                }
            }
        }

        desayunosMeriendas.splice(desayunoIdx,1)
        console.log("desayuno elegido!")

        /////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////// Colación //////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////
        let colacion = {
            id:1,
            type:"Colación",
            maxKcal: maxKcalColacion,
            maxHC: maxHcColacion,
            kcal:0,
            hc: 0,
            receta:{
                descripcion:"",
                cantidades:0,
            },
            bebida:{
                descripcion:"",
                cantidades: 1
            },
            extra:{
                descripcion:"",
                cantidades:0,
                kcal_unidad:0,
                hc_unidad:0
            }
        }
        let colacionIdx = -1

        //Selección de alimento principal
        while(colacion.kcal === 0){
            colacionIdx = Math.floor(Math.random()*colaciones.length)
            let colacionElegido = colaciones[colacionIdx]
            kcalPorCantidad = 0
            hcPorCantidad = 0

            let infoNutricional = informacionNutricional.filter((e) => e.Producto == colacionElegido.ID)
            if(infoNutricional != undefined){
                let gramosXProducto = gramosUnidadProducto.find((e) => e.Producto == colacionElegido.ID)
                if(gramosXProducto){
                    let infoKcal = infoNutricional.find((e) => e.Nombre == 'Kcal')
                    let infoCH = infoNutricional.find((e) => e.Nombre == 'CH')
                    if(infoKcal != undefined) {
                        kcalPorCantidad = parseFloat(infoKcal.Cantidad) * gramosXProducto.Gramos / 100
                    }

                    if(infoCH != undefined){
                        hcPorCantidad = parseFloat(infoCH.Cantidad) * gramosXProducto.Gramos / 100
                    }
                }
            }

            if(kcalPorCantidad < maxKcalColacion){
                let elegirComida = false
                if(aptoDiabetico){
                    if(hcPorCantidad < maxHcColacion){
                        elegirComida = true
                    }
                } else {
                    elegirComida = true
                }
                if(elegirComida){
                    colacion.receta.ID = colacionElegido.ID;
                    colacion.receta.descripcion = colacionElegido.Descripcion;
                    colacion.kcal += kcalPorCantidad
                    colacion.receta.url_imagen = colacionElegido.Foto
                    colacion.receta.cantidades++
                    colacion.receta.kcal = kcalPorCantidad;
                    colacion.receta.hc = hcPorCantidad;
                    colacion.hc += hcPorCantidad
    
                    let bebidaIdx = Math.floor(Math.random()*bebidasDesayunoMeriendas.length)
                    let bebida = bebidasDesayunoMeriendas[bebidaIdx]
                    colacion.bebida.ID = bebida.ID
                    colacion.bebida.descripcion = bebida.Descripcion
                    colacion.bebida.url_imagen = bebida.Foto

                    //Obtengo la información nutricional de la bebida elegida
                    let infoNutricional = informacionNutricional.filter((e) => e.Producto == bebida.ID)
                    if(infoNutricional != undefined){
                        let infoKcal = infoNutricional.find((e) => e.Nombre == 'Kcal')
                        let infoCH = infoNutricional.find((e) => e.Nombre == 'CH')
                        if(infoKcal != undefined) {
                            colacion.bebida.kcal_unidad = parseFloat(infoKcal.Cantidad)
                            colacion.kcal += parseFloat(infoKcal.Cantidad)
                        }

                        if(infoCH != undefined){
                            colacion.bebida.hc_unidad = parseFloat(infoCH.Cantidad)
                            colacion.hc += parseFloat(infoCH.Cantidad)
                        }
                    }

                    let elegirOtraPorcion = false
                    if((colacion.kcal + kcalPorCantidad) < maxKcalColacion){
                        if(aptoDiabetico){
                            if(colacion.hc + hcPorCantidad < maxHcColacion){
                                elegirOtraPorcion = true
                            }                                
                        }
                    }
    
                    while(elegirOtraPorcion){
                        elegirOtraPorcion = false
                        colacion.kcal += kcalPorCantidad
                        if(aptoDiabetico){
                            colacion.hc += hcPorCantidad
                        }
                        colacion.receta.cantidades++

                        if((colacion.kcal + kcalPorCantidad) < maxKcalColacion){
                            if(aptoDiabetico){
                                if(colacion.hc + colacionElegido.hc < maxHcColacion){
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

        //Selección de alimento extra

        //Si la cantidad de kcal o HC está por debajo de un 80%
        //elijo algo de colación para sumar más kcal/hc y completar mejor las cantidades diarias
        elegirExtra = false
        if(colacion.kcal*100/maxKcalColacion < 80){
            if(aptoDiabetico){
                if(colacion.hc*100/maxHcColacion < 80){
                    elegirExtra = true
                }
            } else {
                elegirExtra = true
            }
        }

        //Mientras se siga cumpliendo que no se alcanza al menos el 80% o alguna otra condiciones, sigo agregando extra
        if(elegirExtra){
            elegirExtra = false
            let extraIdx = Math.floor(Math.random()*colaciones.length)
            let extraElegido = colaciones[extraIdx]
            let extraValido = false
            //Obtengo info de granularidad de extra elegido
            let gramosXProducto = gramosUnidadProducto.find((e) => e.Producto == extraElegido.ID)
            let kcalPorCantidadExtra = 0
            let hcPorCantidadExtra = 0

            if(gramosXProducto){
                kcalPorCantidadExtra = parseFloat(extraElegido.Kcal) * gramosXProducto.gramos / 100
                hcPorCantidadExtra = parseFloat(extraElegido.CH) * gramosXProducto.gramos / 100
            }

            if(colacion.kcal + kcalPorCantidadExtra < maxKcalColacion){
                if(aptoDiabetico){
                    if(colacion.hc + hcPorCantidadExtra < maxHcColacion){
                        extraValido = true
                    }
                }else{
                    extraValido = true
                }
            }

            //Elijo la colación extra
            if(extraValido){
                colacion.extra.ID = extraElegido.ID
                colacion.extra.descripcion = extraElegido.Descripcion
                colacion.extra.kcal_unidad = kcalPorCantidadExtra
                colacion.extra.hc_unidad = hcPorCantidadExtra

                while(extraValido){
                    extraValido = false
                    colacion.extra.cantidades++
                    colacion.kcal += kcalPorCantidadExtra
                    colacion.hc += hcPorCantidadExtra

                    if(colacion.kcal*100/maxKcalColacion < 80){
                        if(aptoDiabetico){
                            if(colacion.hc*100/maxHcColacion < 80){
                                elegirExtra = true
                            }
                        } else {
                            elegirExtra = true
                        }
                    }

                    //Todavia se cumple la condición del 80%, 
                    //verifico si puedo elegir de nuevo otra porción de extra
                    if(elegirExtra){
                        if(colacion.kcal + kcalPorCantidadExtra < maxKcalColacion){
                            if(aptoDiabetico){
                                if(colacion.hc + hcPorCantidadExtra < maxHcColacion){
                                    extraValido = true
                                }
                            }else{
                                extraValido = true
                            }
                        }
                    }
                }
            }
        }

        console.log("colación elegida!")

        /////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////// Almuerzo //////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////
        let almuerzo = {
            id:1,
            type:"Almuerzo",
            maxKcal: maxKcalAlmuerzo,
            maxHC: maxHcAlmuerzo,
            kcal:0,
            hc: 0,
            receta:{
                descripcion:"",
                cantidades:0,
                url_imagen:""
            },
            bebida:{
                descripcion:"",
                cantidades: 1
            },
            extra:{
                descripcion:"",
                cantidades:0,
                kcal_unidad:0,
                hc_unidad:0
            }
        }
        let almuerzoIdx = -1
        while(almuerzo.kcal === 0){
            almuerzoIdx = Math.floor(Math.random()*almuerzosCenas.length)
            let almuerzoElegido = almuerzosCenas[almuerzoIdx]
            kcalPorCantidad = parseFloat(almuerzoElegido.Kcal) / almuerzoElegido.Rendimiento
            let hcPorCantidad = parseFloat(almuerzoElegido.CH) / almuerzoElegido.Rendimiento
            if(kcalPorCantidad < maxKcalAlmuerzo){
                let elegirComida = false
                if(aptoDiabetico){
                    if(hcPorCantidad < maxHcAlmuerzo){
                        elegirComida = true
                    }
                } else {
                    elegirComida = true
                }

                if(elegirComida){
                    almuerzo.receta.ID = almuerzoElegido.ID;
                    almuerzo.receta.descripcion = almuerzoElegido.Descripcion;
                    almuerzo.kcal += kcalPorCantidad
                    almuerzo.receta.cantidades++
                    almuerzo.receta.url_imagen = almuerzoElegido.Foto
                    almuerzo.receta.kcal = kcalPorCantidad;
                    almuerzo.receta.hc = hcPorCantidad;
                    almuerzo.hc += hcPorCantidad
    
                    let bebidaIdx = Math.floor(Math.random()*bebidasAlmuerzoCenas.length)
                    let bebida = bebidasAlmuerzoCenas[bebidaIdx]
                    almuerzo.bebida.ID = bebida.ID
                    almuerzo.bebida.descripcion = bebida.Descripcion
                    almuerzo.bebida.url_imagen = bebida.Foto

                    //Obtengo la información nutricional de la bebida elegida
                    let infoNutricional = informacionNutricional.filter((e) => e.Producto == bebida.ID)
                    if(infoNutricional != undefined){
                        let infoKcal = infoNutricional.find((e) => e.Nombre == 'Kcal')
                        let infoCH = infoNutricional.find((e) => e.Nombre == 'CH')
                        if(infoKcal != undefined) {
                            almuerzo.bebida.kcal_unidad = parseFloat(infoKcal.Cantidad)
                            almuerzo.kcal += parseFloat(infoKcal.Cantidad)
                        }

                        if(infoCH != undefined){
                            almuerzo.bebida.hc_unidad = parseFloat(infoCH.Cantidad)
                            almuerzo.hc += parseFloat(infoCH.Cantidad)
                        }
                    }

                    let elegirOtraPorcion = false
                    if((almuerzo.kcal + kcalPorCantidad) < maxKcalAlmuerzo){
                        if(aptoDiabetico){
                            if(almuerzo.hc + hcPorCantidad < maxHcAlmuerzo){
                                elegirOtraPorcion = true
                            }                                
                        } else{
                            elegirOtraPorcion = true
                        }
                    }
    
                    while(elegirOtraPorcion){
                        elegirOtraPorcion = false
                        almuerzo.kcal += kcalPorCantidad
                        almuerzo.hc += hcPorCantidad
                        almuerzo.receta.cantidades++

                        if((almuerzo.kcal + kcalPorCantidad) < maxKcalAlmuerzo){
                            if(aptoDiabetico){
                                if(almuerzo.hc + hcPorCantidad < maxHcAlmuerzo){
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

        //Selección de alimento extra

        //Si la cantidad de kcal o HC está por debajo de un 80%
        //elijo algo de colación para sumar más kcal/hc y completar mejor las cantidades diarias
        elegirExtra = false
        if(almuerzo.kcal*100/maxKcalAlmuerzo < 80){
            if(aptoDiabetico){
                if(almuerzo.hc*100/maxHcAlmuerzo < 80){
                    elegirExtra = true
                }
            } else {
                elegirExtra = true
            }
        }

        //Mientras se siga cumpliendo que no se alcanza al menos el 80% o alguna otra condiciones, sigo agregando extra
        if(elegirExtra){
            elegirExtra = false
            let extraIdx = Math.floor(Math.random()*colaciones.length)
            let extraElegido = colaciones[extraIdx]
            let extraValido = false
            let gramosXProducto = gramosUnidadProducto.find((e) => e.Producto == extraElegido.ID)
            let kcalPorCantidadExtra = 0
            let hcPorCantidadExtra = 0

            if(gramosXProducto){
                kcalPorCantidadExtra = parseFloat(extraElegido.Kcal) * gramosXProducto.gramos / 100
                hcPorCantidadExtra = parseFloat(extraElegido.CH) * gramosXProducto.gramos / 100
            }

            if(almuerzo.kcal + kcalPorCantidadExtra < maxKcalAlmuerzo){
                if(aptoDiabetico){
                    if(almuerzo.hc + hcPorCantidadExtra < maxHcAlmuerzo){
                        extraValido = true
                    }
                }else{
                    extraValido = true
                }
            }

            //Elijo la colación extra
            if(extraValido){
                almuerzo.extra.ID = extraElegido.ID
                almuerzo.extra.descripcion = extraElegido.Descripcion
                almuerzo.extra.kcal_unidad = kcalPorCantidadExtra
                almuerzo.extra.hc_unidad = hcPorCantidadExtra

                while(extraValido){
                    extraValido = false
                    almuerzo.extra.cantidades++
                    almuerzo.kcal += kcalPorCantidadExtra
                    almuerzo.hc += hcPorCantidadExtra

                    if(almuerzo.kcal*100/maxKcalAlmuerzo < 80){
                        if(aptoDiabetico){
                            if(almuerzo.hc*100/maxHcAlmuerzo < 80){
                                elegirExtra = true
                            }
                        } else {
                            elegirExtra = true
                        }
                    }

                    //Todavia se cumple la condición del 80%, 
                    //verifico si puedo elegir de nuevo otra porción de extra
                    if(elegirExtra){
                        if(almuerzo.kcal + kcalPorCantidadExtra < maxKcalAlmuerzo){
                            if(aptoDiabetico){
                                if(almuerzo.hc + hcPorCantidadExtra < maxHcAlmuerzo){
                                    extraValido = true
                                }
                            }else{
                                extraValido = true
                            }
                        }
                    }
                }
            }
        }

        console.log("almuerzo elegida!")

        /////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////// Merienda //////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////
        let merienda = {
            id:2,
            type:"Merienda",
            maxKcal: maxKcalMerienda,
            maxHC: maxHcMerienda,
            kcal:0,
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
            extra:{
                descripcion:"",
                cantidades:0,
                kcal_unidad:0,
                hc_unidad:0
            }
        }
        let meriendaIdx = -1;
        while(merienda.kcal === 0){
            meriendaIdx = Math.floor(Math.random()*desayunosMeriendas.length)
            let meriendaElegida = desayunosMeriendas[meriendaIdx]
            kcalPorCantidad = parseFloat(meriendaElegida.Kcal) / meriendaElegida.Rendimiento
            let hcPorCantidad = parseFloat(meriendaElegida.CH) / meriendaElegida.Rendimiento

            if(kcalPorCantidad < maxKcalMerienda){
                let elegirComida = false
                if(aptoDiabetico){
                    if(hcPorCantidad < maxHcMerienda){
                        elegirComida = true
                    }
                } else {
                    elegirComida = true
                }

                if(elegirComida){
                    merienda.receta.ID = meriendaElegida.ID;
                    merienda.receta.descripcion = meriendaElegida.Descripcion;
                    merienda.kcal += kcalPorCantidad
                    merienda.receta.cantidades++
                    merienda.receta.url_imagen = meriendaElegida.Foto
                    merienda.receta.kcal = kcalPorCantidad;
                    merienda.receta.hc = hcPorCantidad;
                    merienda.hc += hcPorCantidad
    
                    let bebidaIdx = Math.floor(Math.random()*bebidasDesayunoMeriendas.length)
                    let bebida = bebidasDesayunoMeriendas[bebidaIdx]
                    merienda.bebida.ID = bebida.ID
                    merienda.bebida.descripcion = bebida.Descripcion
                    merienda.bebida.url_imagen = bebida.Foto

                   //Obtengo la información nutricional de la bebida elegida
                   let infoNutricional = informacionNutricional.filter((e) => e.Producto == bebida.ID)
                   if(infoNutricional != undefined){
                       let infoKcal = infoNutricional.find((e) => e.Nombre == 'Kcal')
                       let infoCH = infoNutricional.find((e) => e.Nombre == 'CH')
                       if(infoKcal != undefined) {
                           merienda.bebida.kcal_unidad = parseFloat(infoKcal.Cantidad)
                           merienda.kcal += parseFloat(infoKcal.Cantidad)
                       }

                       if(infoCH != undefined){
                           merienda.bebida.hc_unidad = parseFloat(infoCH.Cantidad)
                           merienda.hc += parseFloat(infoCH.Cantidad)
                       }
                   }

                    let elegirOtraPorcion = false
                    if((merienda.kcal + kcalPorCantidad) < maxKcalMerienda){
                        if(aptoDiabetico){
                            if(merienda.hc + hcPorCantidad < maxHcMerienda){
                                elegirOtraPorcion = true
                            }                                
                        } else {
                            elegirOtraPorcion = true
                        }
                    }
    
                    while(elegirOtraPorcion){
                        elegirOtraPorcion = false
                        merienda.kcal += kcalPorCantidad
                        merienda.hc += hcPorCantidad
                        merienda.receta.cantidades++

                        if((merienda.kcal + kcalPorCantidad) < maxKcalMerienda){
                            if(aptoDiabetico){
                                if(merienda.hc + hcPorCantidad < maxHcMerienda){
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

        //Selección de alimento extra

        //Si la cantidad de kcal o HC está por debajo de un 80%
        //elijo algo de colación para sumar más kcal/hc y completar mejor las cantidades diarias
        elegirExtra = false
        if(merienda.kcal*100/maxKcalMerienda < 80){
            if(aptoDiabetico){
                if(merienda.hc*100/maxHcMerienda < 80){
                    elegirExtra = true
                }
            } else {
                elegirExtra = true
            }
        }

        //Mientras se siga cumpliendo que no se alcanza al menos el 80% o alguna otra condiciones, sigo agregando extra
        if(elegirExtra){
            elegirExtra = false
            let extraIdx = Math.floor(Math.random()*colaciones.length)
            let extraElegido = colaciones[extraIdx]
            let extraValido = false
            let gramosXProducto = gramosUnidadProducto.find((e) => e.Producto == extraElegido.ID)
            let kcalPorCantidadExtra = 0
            let hcPorCantidadExtra = 0

            if(gramosXProducto){
                kcalPorCantidadExtra = parseFloat(extraElegido.Kcal) * gramosXProducto.gramos / 100
                hcPorCantidadExtra = parseFloat(extraElegido.CH) * gramosXProducto.gramos / 100
            }

            if(merienda.kcal + kcalPorCantidadExtra < maxKcalMerienda){
                if(aptoDiabetico){
                    if(merienda.hc + hcPorCantidadExtra < maxHcMerienda){
                        extraValido = true
                    }
                }else{
                    extraValido = true
                }
            }

            //Elijo la colación extra
            if(extraValido){
                merienda.extra.ID = extraElegido.ID
                merienda.extra.descripcion = extraElegido.Descripcion
                merienda.extra.kcal_unidad = kcalPorCantidadExtra
                merienda.extra.hc_unidad = hcPorCantidadExtra

                while(extraValido){
                    extraValido = false
                    merienda.extra.cantidades++
                    merienda.kcal += kcalPorCantidadExtra
                    merienda.hc += hcPorCantidadExtra

                    if(merienda.kcal*100/maxKcalMerienda < 80){
                        if(aptoDiabetico){
                            if(merienda.hc*100/maxHcMerienda < 80){
                                elegirExtra = true
                            }
                        } else {
                            elegirExtra = true
                        }
                    }

                    //Todavia se cumple la condición del 80%, 
                    //verifico si puedo elegir de nuevo otra porción de extra
                    if(elegirExtra){
                        if(merienda.kcal + kcalPorCantidadExtra < maxKcalMerienda){
                            if(aptoDiabetico){
                                if(merienda.hc + hcPorCantidadExtra < maxHcDesayuno){
                                    extraValido = true
                                }
                            }else{
                                extraValido = true
                            }
                        }
                    }
                }
            }
        }
        console.log("merienda elegida!")

        /////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////// Cena //////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////
        let cena = {
            id:3,
            type:"Cena",
            maxKcal:maxKcalCena,
            maxHC:maxHcCena,
            kcal:0,
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
            extra:{
                descripcion:"",
                cantidades:0,
                kcal_unidad:0,
                hc_unidad:0
            }
        }
        let cenaIdx = -1
        while(cena.kcal === 0){
            cenaIdx = Math.floor(Math.random()*almuerzosCenas.length)
            let cenaElegida = almuerzosCenas[cenaIdx]
            kcalPorCantidad = parseFloat(cenaElegida.Kcal) / cenaElegida.Rendimiento
            let hcPorCantidad = parseFloat(cenaElegida.CH) / cenaElegida.Rendimiento

            if(kcalPorCantidad < maxKcalCena){
                let elegirComida = false
                if(aptoDiabetico){
                    if(hcPorCantidad < maxHcCena){
                        elegirComida = true
                    }
                } else {
                    elegirComida = true
                }

                if(elegirComida){
                    cena.receta.ID = cenaElegida.ID;
                    cena.receta.descripcion = cenaElegida.Descripcion;
                    cena.kcal += kcalPorCantidad
                    cena.receta.cantidades++
                    cena.receta.url_imagen = cenaElegida.Foto
                    cena.receta.kcal = kcalPorCantidad;
                    cena.receta.hc = hcPorCantidad;
                    cena.hc += hcPorCantidad
    
                    let bebidaIdx = Math.floor(Math.random()*bebidasAlmuerzoCenas.length)
                    let bebida = bebidasAlmuerzoCenas[bebidaIdx]
                    cena.bebida.ID = bebida.ID
                    cena.bebida.descripcion = bebida.Descripcion
                    cena.bebida.url_imagen = bebida.Foto

                    //Obtengo la información nutricional de la bebida elegida
                    let infoNutricional = informacionNutricional.filter((e) => e.Producto == bebida.ID)
                    if(infoNutricional != undefined){
                        let infoKcal = infoNutricional.find((e) => e.Nombre == 'Kcal')
                        let infoCH = infoNutricional.find((e) => e.Nombre == 'CH')
                        if(infoKcal != undefined) {
                            cena.bebida.kcal_unidad = parseFloat(infoKcal.Cantidad)
                            cena.kcal += parseFloat(infoKcal.Cantidad)
                        }

                        if(infoCH != undefined){
                            cena.bebida.hc_unidad = parseFloat(infoCH.Cantidad)
                            cena.hc += parseFloat(infoCH.Cantidad)
                        }
                    }

                    let elegirOtraPorcion = false
                    if((cena.kcal + kcalPorCantidad) < maxKcalCena){
                        if(aptoDiabetico){
                            if(cena.hc + hcPorCantidad < maxHcCena){
                                elegirOtraPorcion = true
                            }                                
                        } else {
                            elegirOtraPorcion = true
                        }
                    }
    
                    while(elegirOtraPorcion){
                        elegirOtraPorcion = false
                        cena.kcal += kcalPorCantidad
                        cena.hc += hcPorCantidad
                        cena.receta.cantidades++

                        if((cena.kcal + kcalPorCantidad) < maxKcalCena){
                            if(aptoDiabetico){
                                if(cena.hc + hcPorCantidad < maxHcCena){
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

        //Selección de alimento extra

        //Si la cantidad de kcal o HC está por debajo de un 80%
        //elijo algo de colación para sumar más kcal/hc y completar mejor las cantidades diarias
        elegirExtra = false
        if(cena.kcal*100/maxKcalCena < 80){
            if(aptoDiabetico){
                if(cena.hc*100/maxHcCena < 80){
                    elegirExtra = true
                }
            } else {
                elegirExtra = true
            }
        }

        //Mientras se siga cumpliendo que no se alcanza al menos el 80% o alguna otra condiciones, sigo agregando extra
        if(elegirExtra){
            elegirExtra = false
            let extraIdx = Math.floor(Math.random()*colaciones.length)
            let extraElegido = colaciones[extraIdx]
            let extraValido = false
            let gramosXProducto = gramosUnidadProducto.find((e) => e.Producto == extraElegido.ID)
            let kcalPorCantidadExtra = 0
            let hcPorCantidadExtra = 0
            if(gramosXProducto){
                kcalPorCantidadExtra = parseFloat(extraElegido.Kcal) * gramosXProducto.gramos / 100
                hcPorCantidadExtra = parseFloat(extraElegido.CH) * gramosXProducto.gramos / 100
            }

            if(cena.kcal + kcalPorCantidadExtra < maxKcalCena){
                if(aptoDiabetico){
                    if(cena.hc + hcPorCantidadExtra < maxHcCena){
                        extraValido = true
                    }
                }else{
                    extraValido = true
                }
            }

            //Elijo la colación extra
            if(extraValido){
                cena.extra.ID = extraElegido.ID
                cena.extra.descripcion = extraElegido.Descripcion
                cena.extra.kcal_unidad = kcalPorCantidadExtra
                cena.extra.hc_unidad = hcPorCantidadExtra

                while(extraValido){
                    extraValido = false
                    cena.extra.cantidades++
                    cena.kcal += kcalPorCantidadExtra
                    cena.hc += hcPorCantidadExtra

                    if(cena.kcal*100/maxKcalColacion < 80){
                        if(aptoDiabetico){
                            if(cena.hc*100/maxHcDesayuno < 80){
                                elegirExtra = true
                            }
                        } else {
                            elegirExtra = true
                        }
                    }

                    //Todavia se cumple la condición del 80%, 
                    //verifico si puedo elegir de nuevo otra porción de extra
                    if(elegirExtra){
                        if(cena.kcal + kcalPorCantidadExtra < maxKcalCena){
                            if(aptoDiabetico){
                                if(cena.hc + hcPorCantidadExtra < maxHcCena){
                                    extraValido = true
                                }
                            }else{
                                extraValido = true
                            }
                        }
                    }
                }
            }
        }
        console.log("cena elegida!")

    
        plan = [
            desayuno,
            colacion,
            almuerzo,
            merienda,
            cena
        ]
        console.log(plan)
        console.log(`Total KCAL: ${desayuno.kcal + colacion.kcal + almuerzo.kcal + merienda.kcal + cena.kcal} - Total HC: ${desayuno.hc + colacion.hc + almuerzo.hc + merienda.hc + cena.hc}`)
    }

    return plan
}

let getPlanDietarioSemanal = function(aptoObesidad, aptoDiabetico, aptoCeliaco, recetas, colaciones, bebidasDesayunoMeriendas, bebidasAlmuerzoCenas, informacionNutricional, gramosUnidadProducto){
    let plan = []
    for(var i = 0; i <= 6; i++){
        plan[i] = getPlanDietarioDiario(aptoObesidad, aptoDiabetico, aptoCeliaco, recetas, colaciones, bebidasDesayunoMeriendas, bebidasAlmuerzoCenas, informacionNutricional, gramosUnidadProducto)
    }

    return plan
}

let foo = "asd"

module.exports = {getPlanDietarioDiario, getPlanDietarioSemanal}