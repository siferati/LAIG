/**
 * Class that represents a single component
 * @param id ID of the material
 * @param transformation Object of Class xmlTransf
 * @param materials Object of Class xmlMaterials (could be just a simple array, but this helps with debugging!)
 * @param texture Object of Class xmlText
 * @param children Object of Class xmlCompChildren (could be just a simple bi-dim array, but this helps with debugging!)
 */
function xmlComp(id, transformation, materials, texture, children) {
    this.id = id;
    this.transformation = transformation;
    this.materials = materials;
    this.texture = texture;
    this.children = children;
    this.matID = "s";
    this.text;
    this.mat;
}

/**
 * Draws this component to the screen
 * @param scene Scene
 * @param fatherTexture xmlText object
 */
xmlComp.prototype.display = function(scene, fatherTextureID, fatherMaterialID) {
    //push matrix
    scene.pushMatrix();
    //apply transformation
    this.transformation.apply(scene);



    this.matID = this.materials.getID();
    this.text = this.texture;
    var mat;
    if (this.matID != 'inherit') {

      this.mat = this.materials.load(scene);


    } else {
        var xmlMat = scene.graph.materials.findById(fatherMaterialID);
        this.matID = xmlMat.id;
        this.mat = xmlMat.load(scene);

    }




    if (this.texture.id != 'inherit') {
        if (this.texture.id == 'none') {
            this.mat.setTexture(null); // sem textura
            this.texture.texture = null;
            console.log("1");
        } else {
            this.texture.load(scene,this.texture); // textura prorpia
            console.log("2");
        }
    } else {
        if (fatherTextureID == 'none') {
            this.mat.setTexture(null);
            this.texture.texture = null;
            console.log("3");
        } else {
            this.text = scene.graph.textures.findById(fatherTextureID);
            this.texture.load(scene,this.text);

            console.log("4");
        }
    }

    this.mat.apply()

  if(this.texture.texture != null){
    this.texture.texture.bind();
  }


    //desenhar primitivas
    this.children.primitives.display(scene, this.texture);


      if(this.texture.texture != null){
        this.texture.texture.unbind();
      }
    // aceder aos components
    this.children.components.display(scene, this.text.id, this.matID);
    //pop matrix
    scene.popMatrix();
};

/**
 * Change material
 * @param scene Scene
 */
xmlComp.prototype.nextMaterial = function(scene) {
    //change material
    this.materials.nextMaterial(scene, this.texture.texture);
    // aceder aos components
    this.children.components.nextMaterial(scene);

};





/**
 * Outputs every attr to the console
 */
xmlComp.prototype.consoleDebug = function() {
    console.log("--- START COMPONENT DEBUGGING ---");
    //debug id
    console.log("Id: " + this.id);
    //debug transformation
    console.log("Transformation:");
    if (this.transformation != null) this.transformation.consoleDebug();
    //debug materials
    console.log("Materials:");
    if (this.materials != null) this.materials.consoleDebug();
    //debug texture
    console.log("Texture:");
    if (this.texture != null) this.texture.consoleDebug();
    //debug children
    console.log("Children:");
    if (this.children != null) this.children.consoleDebug();
    console.log("--- FINISH COMPONENT DEBUGGING ---");
};

/**
 * Class that represents the children of a component (it's basically just a struct with 2 arays)
 * @param childrenComp Object of Class xmlComponents
 * @param childrenPrim Object of Class xmlPrimitives
 */
function xmlCompChildren(childrenComp, childrenPrim) {
    this.components = childrenComp;
    this.primitives = childrenPrim;
};

/**
 * Outputs every attr to the console
 */
xmlCompChildren.prototype.consoleDebug = function() {
    console.log("--- START COMP CHILDREN DEBUGGING ---");
    //debug components
    console.log("Components:");
    this.components.consoleDebug();
    //debug primitives
    console.log("Primitives:");
    this.primitives.consoleDebug();
    console.log("--- FINISH COMP CHILDREN DEBUGGING ---");
};

/**
 * Class that represents an array of components
 * @param arrayComponents Array of objects of Class xmlComp
 */
function xmlComponents(arrayComponents) {
    this.components = arrayComponents.slice(0);
};

xmlComponents.prototype.getLength = function() {
    return this.components.length;
};

xmlComponents.prototype.display = function(scene, fatherTextureID, fatherMaterialID) {
    var n = this.components.length;
    for (var i = 0; i < n; i++) {
        this.components[i].display(scene, fatherTextureID, fatherMaterialID);
    }
};

xmlComponents.prototype.nextMaterial = function(scene) {
    var n = this.components.length;
    for (var i = 0; i < n; i++) {
        this.components[i].nextMaterial(scene);
    }
};

/**
 * Scan components array to find match with parameter id and return it
 * @param id Id to match with
 * @return Matched element. False otherwise
 */
xmlComponents.prototype.findById = function(id) {
    //percorrer o array
    for (var i = 0; i < this.components.length; i++) {
        //match id
        if (this.components[i].id === id) {
            return this.components[i];
        }
    }
    return false;
}

/**
 * Outputs every attr to the console
 */
xmlComponents.prototype.consoleDebug = function() {
    console.log("--- START COMPONENTS DEBUGGING ---");
    console.log("Components[" + this.components.length + "]:");
    for (var i = 0; i < this.components.length; i++) {
        this.components[i].consoleDebug();
    }
    console.log("--- FINISH COMPONENTS DEBUGGING ---");
};
