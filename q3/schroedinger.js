function Schroedinger(settings){
	
	this.size          = settings.size;
	this.energy        = settings.energy;
	this.median        = settings.median;
	this.sigma         = settings.sigma;
	this.timeStep      = settings.timeStep;
	this.stepsPerFrame = settings.stepsPerFrame;
	this.maxFrames     = settings.maxFrames;
	this.momentumZoom  = settings.momentumZoom;
	this.scaleFactor   = settings.scaleFactor;
	this.potential     = settings.potential;
	this.label         = settings.label;
	this.underlay      = settings.underlay;
	this.imageFile     = settings.imageFile;
	this.dataFile      = settings.dataFile;
	
	this.xStep         = 1/(this.size - 1);
	this.pStep         = 2*Math.PI;
	this.psiX          = new Array(this.size).fill(new Complex());
	this.psiP          = new Array(this.size).fill(new Complex());
	this.potEnergy     = new Array(this.size).fill(0.);
	this.diagT         = new Array(this.size).fill(0.);
	this.auxA          = new Array(this.size).fill(0.);
	this.rhoX          = new Array(this.size).fill(0.);
	this.rhoP          = new Array(this.size).fill(0.);
	this.plotPot       = new Array(width);
	this.plotX         = new Array(width);
	this.plotP         = new Array(width);
	this.maxPot        = -Infinity;
	this.minPot        = Infinity;
	this.maxFourierAmp = 0.;
	this.frameCount    = 0;
	this.statistics    = {time: 0, normX: 0, normP: 0, meanX: 0, meanP: 0, rmsX: 0, rmsP: 0, leftX: 0, leftP: 0};
	this.dataTable     = null;
	
	/*************************************************************************************************/
	
	this.initialize = function(){
		let start = Math.floor(this.median*(this.size - 1));
		this.computePsiAndV(start, +1);
		this.computePsiAndV(start, -1);
		this.updateMomenta();
		
		this.computeTridiagonalMatrix();
		this.initializePlotParameters();
		
		this.updateStatistics();
		this.show();
		this.frameCount++;
		this.statistics.time += this.stepsPerFrame*this.timeStep;
	} 
	
	/*************************************************************************************************/
	
	this.computePsiAndV = function(startIndex, sign){
		let phase  = 0;
		let decay  = 0;
		
		for(let i = startIndex; (i > 0) && (i < this.size - 1); i += sign){
			let envelope      = Math.sin(this.xStep*15*i)*Math.exp(-this.xStep*15*i);

			let phaseFactor   = new Complex(Math.cos(phase), Math.sin(phase)); 
			this.psiX[i]      = phaseFactor.mul(envelope);
			this.rhoX[i]      = this.psiX[i].sqr();
			this.potEnergy[i] = this.potential(this.xStep*i);
			let increment     = sign*Math.sqrt(2*Math.abs(this.energy - this.potEnergy[i]))*this.xStep;
			phase            += (this.potEnergy[i] < this.energy)? increment : 0;
			decay            += (this.potEnergy[i] < this.energy)? 0 : increment;
			this.maxPot       = Math.max(this.maxPot, this.potEnergy[i]);
			this.minPot       = Math.min(this.minPot, this.potEnergy[i]);
		}			
	}
	
	/*************************************************************************************************/
	
	this.updateMomenta = function(){
		
	}
	
	/*************************************************************************************************/
	
	this.computeTridiagonalMatrix = function(){
		let imaginary = new Complex(0, 4*this.xStep*this.xStep/this.timeStep);
		let scalar    = this.xStep*this.xStep*2;
		
		for(let i = 1; i < this.size-1; i++){
			this.diagT[i] = (new Complex()).add(imaginary,scalar*this.potEnergy[i], 2);
			this.auxA[i] = (i > 1) ? (new Complex(-1)).mul(this.auxA[i-1]) : new Complex();
			this.auxA[i].sub(imaginary).add(scalar*this.potEnergy[i], 2).invert();
		}
	}
	
	/*************************************************************************************************/
	
	this.initializePlotParameters = function(){
		for(let j = 1; j < width-1; j++){
			let x       = j/(width - 1);
			let inArray = { x: this.size*x,           p: this.size*(0.5 + (x - 0.5)/this.momentumZoom) };
			let index   = { x: Math.floor(inArray.x), p: Math.floor(inArray.p)                         };
			let weight  = { x: inArray.x - index.x,   p: inArray.p - index.p                           };
		
			this.plotX[j] = {i: index.x, w: weight.x};
			this.plotP[j] = {i: index.p, w: weight.p};
			this.plotPot[j] = this.potential(x);
		}	
	}
	
	/*************************************************************************************************/
	
	this.updateStatistics = function(){
		
	}
	
	/*************************************************************************************************/
	
	this.appendDataTable = function(){
		
	}
	
	/*************************************************************************************************/
	
	this.show = function(){
		background(30);
		
		let textHeight = height/30;
		let topMargin  = 0;
		let heightX    = 1*height;
		let seperator  = heightX;
		let heightP    = height - 2*topMargin - heightX - 2;
		
		this.drawUnderlay(seperator,heightX - 2*topMargin, 2*topMargin);
		this.plotComplexData(this.psiX, this.plotX, heightX, topMargin, this.scaleFactor);
		this.plotComplexData(this.psiP, this.plotP, heightP, height - heightP, 1/this.maxFourierAmp);
		this.drawOverlay(seperator, textHeight);
		
		if(this.imageFile !== null){
			saveCanvas(this.imageFile + this.frameCount + '.png');
			console.log('-> Frame saved as ' + this.imageFile + this.frameCount + '.png');
		}
	}
	
	/*************************************************************************************************/
	
	this.drawUnderlay = function(seperatorHeight, plotHeight, topMargin){
		if(this.frameCount == 0){
			let maxPotEnergyWaveVector = Math.sqrt(2*this.maxPot);
			let maxWaveVector          = Math.PI/this.xStep;
			let delta                  = 0.5*width*maxPotEnergyWaveVector/maxWaveVector*this.momentumZoom;
			
			this.underlay.stroke(235);
			this.underlay.strokeWeight(3);
			this.underlay.line(0,seperatorHeight,width,seperatorHeight);
			this.underlay.strokeWeight(1);
			this.underlay.fill(100);
			this.underlay.rect(0.5*width - delta,seperatorHeight, 2*delta, height-seperatorHeight);
			this.underlay.line(0.5*width, seperatorHeight, 0.5*width, height); 
						
			this.underlay.fill(60);
			
			this.underlay.beginShape();
			this.underlay.vertex(0,seperatorHeight-1);
			this.underlay.vertex(0,plotHeight + topMargin);
			let y = plotHeight + topMargin;
			if(this.maxPot > this.minPot){
				for(let j = 1; j < width-1; j++){
					y = plotHeight*(this.maxPot - this.plotPot[j])/(this.maxPot - this.minPot) + topMargin;
					this.underlay.vertex(j, y);
				}
			}
			this.underlay.vertex(width-1,y);
			this.underlay.vertex(width-1,seperatorHeight-1);
			this.underlay.endShape(CLOSE);
		}
		
		image(this.underlay,0,0);
	}
	
	/*************************************************************************************************/
	
	this.plotComplexData = function(data, plotMap, plotHeight, topMargin, scaleFactor){

		strokeWeight(0.75);
		colorMode(HSB, 255);

		for(let j = 1; j < width-1; j++){
			let a   = new Complex(1 - plotMap[j].w);
			let b   = new Complex(plotMap[j].w);
			let i   = plotMap[j].i;
			let val = (new Complex()).add(a.mul(data[i]),b.mul(data[i+1]));
			let y   = plotHeight*(1 - val.abs()*scaleFactor) + topMargin;
			let cl  = Math.floor((val.arg()/Math.PI + 1)*128);
			
			stroke(255,225,235);
			line(j,plotHeight + topMargin,j,y);
		}
	}
	
	/*************************************************************************************************/
	
	this.drawOverlay = function(seperatorHeight, textHeight){

	}
	
	/*************************************************************************************************/
	
	this.propagate = function(){
		let auxB = new Array(this.size);
		
		for(let step = 0; step < this.stepsPerFrame; step++){
			for(let i = 1; i < this.size - 1; i++){
				auxB[i] = (i > 1) ? (new Complex(auxB[i-1])).mul(this.auxA[i-1]) : new Complex();
				auxB[i].add((new Complex(this.diagT[i])).mul(this.psiX[i]).sub(this.psiX[i-1],this.psiX[i+1]));
			}
			for(let i = this.size - 2; i > 0; i--){
				this.psiX[i].set(this.psiX[i+1]).sub(auxB[i]).mul(this.auxA[i]);
				this.rhoX[i] += this.psiX[i].sqr();
			}
		}
	}
	
	/*************************************************************************************************/
	
	this.simulationStep = function(){
		console.log('--- ITERATION ' + this.frameCount + ' ---');
		
		this.propagate();
		this.show();
		
		this.frameCount++;
	}
	
	/*************************************************************************************************/
	
	this.saveAverageDensity = function(){

	}
	
	/*************************************************************************************************/
	
	this.initialize();	
}

