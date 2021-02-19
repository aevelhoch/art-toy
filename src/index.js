import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const block = {
	top: 0,
	left: 0,
	bottom: 100,
	right: 100,
	lines: true,
	color: "#FFFFFF",
}

function Block(props) {
	let boxStyle = {
		width: props.stats.right - props.stats.left + '%',
		height: props.stats.bottom - props.stats.top + '%',
		top: props.stats.top + '%',
		left: props.stats.left + '%',
		background: props.stats.color,
	};
	
	// if color is dark enough, set lines around box to dark grey so they stand out
	let colorR = 30;
	let colorG = 30;
	let colorB = 30;
	if (props.stats.color !== undefined){
		colorR = parseInt(props.stats.color.slice(1,3),16);
		colorG = parseInt(props.stats.color.slice(3,5),16);
		colorB = parseInt(props.stats.color.slice(5,7),16);
	}
	let cName = "littleBox";
	if(props.stats.lines === false) cName += "Off";
	else if(colorR < 30 && colorG < 30 && colorB < 30) cName += "Dark";
	return (
		<div className={cName} onClick={props.onClick} style={boxStyle}
			>
			{/*props.index*/}
		</div>
	);
}

class Board extends React.Component {	
  renderBlock(i) {
    return (
		<Block 
			stats={this.props.blocks[i]} 
			key={i}
			index={i}
			onClick={() => this.props.onClick(i)}
		/>
	);
  }

  render() {
	let renderMe = [];
	for(let i = 0; i < this.props.blocks.length; i++){
		renderMe.push(this.renderBlock(i));
	}
	  
    return (
		<div id="bigbox">
			{renderMe}
		</div>
    );
  }
}

class Palette extends React.Component {
	// helper function to render individual blocks for palette
	renderColorBlock(i) {
		// block gets color of ith entry in palette
		let blockStyle = {
			background: this.props.palette[i],
		};
		return (
		// onClick is the function to set current color to ith entry in palette
			<div 
				className="palettetile" 
				onClick={()=>this.props.onClick(i)} 
				key={i} 
				style={blockStyle}>
			</div>
		);
	}
	
	render() {	
		// add each color in palette to array of blocks to render
		let renderMe = [];
		for(let i = 0; i < this.props.palette.length; i++){
			renderMe.push(this.renderColorBlock(i));
		}
		// then add final '+' block with addToPalette function to array of blocks to render
		renderMe.push(<div className="palettetile" onClick={()=>this.props.addToPalette()} key={renderMe.length}><span id="paletteplus">+</span></div>)
	
		return(
			<div id="paletteholder">
				{renderMe}
			</div>
		)
	};
}

class PopUp extends React.Component {
	constructor(props) {
		super(props)
		this.handleChange = this.handleChange.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
	}
	
	handleChange(event) {
		//this.setState({value: event.target.value})
	}
	
	handleSubmit(event) {
		event.preventDefault()
		this.props.stringToBlockState(document.getElementById("loadfield").value)
		this.props.setPopUpState("none")
	}
	
	render() {		
		if (this.props.popupState === "clear"){
			return(
			<>
				<div id="bgcover">
				</div>
				<div className="popup" id="popupclear">
					<strong>Clear?</strong>
					Are you sure you want to clear the canvas?
					<em>(You will not be able to undo this.)</em><br/>
					<div id="popupbuttonholder">
						<div className="popupbutton" onClick={()=>this.props.clearFunc()}>Yes</div>
						<div className="popupbutton" onClick={()=>this.props.setState("none")}>No</div>
					</div>
				</div>
			</>
			)
		}
		else if (this.props.popupState === "save/load"){
			return(
			<>
				<div id="bgcover">
				</div>
				<div className="popup" id="popupsave">
					<form onSubmit={this.handleSubmit}>
						<strong>Save/Load</strong>
						To save your image, copy the text in this text box and save it somewhere.
						<br/>
						<em className="smalltext">(Saving or loading an image does not preserve the undo history.)</em>
						<br/>
						<div className="centerme">
							<input type="text" className="saveloadtextbox" id="savefield" value={this.props.blockStateToString()} onChange={this.handleChange}/>
						</div>
						<br/>
						To load an image, paste the text for a saved image in this text box and press OK.
						<br/>
						<em className="smalltext">(Press OK with an empty text box to cancel loading)</em>
						<br/>
						<div className="centerme">
							<input type="text" className="saveloadtextbox" id="loadfield"/>
						</div>
						<br/>
						<div id="popupbuttonholder">
							<button className="popupbutton" type="submit">OK</button>
						</div>
					</form>
				</div>
			</>
			)
		}
		else {
			return(null)
		}
	}
}

class App extends React.Component {
	constructor(props) {
		super(props);
		// setup first Block
		let firstBlock = Object.create(block);
		firstBlock.top = 0;
		firstBlock.left = 0;
		firstBlock.bottom = 100;
		firstBlock.right = 100;
		// set starting state
		this.state = {
		blocks: [firstBlock],
		undoBlocks: [],
		palette: [],
		splitDir: "H",
		toolSelected: "split",
		lines: true,
		popup: "none",
		};
	}
	
	splitBlockHoriz(i){
		// if the lines are off, instead just turn them on
		if (!this.state.lines){
			this.swapLineDisplay();
			return;
		}
		
		// add current state to undoQueue
		let undoQueue = JSON.parse(JSON.stringify(this.state.undoBlocks));
		let tempBlock = JSON.parse(JSON.stringify(this.state.blocks));
		undoQueue.push(tempBlock);
		this.setState({undoBlocks: undoQueue});
		
		// create two blocks that are horiz splits of block i
		let newBlockHeight = (this.state.blocks[i].bottom - this.state.blocks[i].top)/2.0;
		let blockOneBottom = this.state.blocks[i].top + newBlockHeight;
		let bothBlockLeft = this.state.blocks[i].left;
		let bothBlockRight = this.state.blocks[i].right;
		let newBlockTop = Object.create(block);
		newBlockTop.top = this.state.blocks[i].top;
		newBlockTop.bottom = newBlockTop.top + newBlockHeight;
		newBlockTop.left = bothBlockLeft;
		newBlockTop.right = bothBlockRight;
		let newBlockBottom = Object.create(block);
		newBlockBottom.top = blockOneBottom;
		newBlockBottom.bottom = blockOneBottom + newBlockHeight;
		newBlockBottom.left = bothBlockLeft;
		newBlockBottom.right = bothBlockRight;
		newBlockBottom.color = this.state.blocks[i].color;
		
		// get blocks, put top split block in i's place, and append bottom split block to end of blocks
		let tempBlocks = [];
		Object.assign(tempBlocks, this.state.blocks);
		Object.assign(tempBlocks[i], newBlockTop);
		tempBlocks.push(newBlockBottom);
		this.setState({blocks: tempBlocks});
	}
	
	splitBlockVert(i){
		if (!this.state.lines){
			this.swapLineDisplay();
			return;
		}
		
		// add current state to undoQueue
		let undoQueue = JSON.parse(JSON.stringify(this.state.undoBlocks));
		let tempBlock = JSON.parse(JSON.stringify(this.state.blocks));
		undoQueue.push(tempBlock);
		this.setState({undoBlocks: undoQueue});
		
		// create two blocks that are vertical splits of block i
		let newBlockWidth = (this.state.blocks[i].right-this.state.blocks[i].left)/2.0;
		let blockOneRight = this.state.blocks[i].left + newBlockWidth;
		let bothBlockTop = this.state.blocks[i].top;
		let bothBlockBottom = this.state.blocks[i].bottom;
		let newBlockLeft = Object.create(block);
		newBlockLeft.top = bothBlockTop;
		newBlockLeft.bottom = bothBlockBottom;
		newBlockLeft.left = this.state.blocks[i].left;
		newBlockLeft.right = blockOneRight;
		let newBlockRight = Object.create(block);
		newBlockRight.top = bothBlockTop;
		newBlockRight.bottom = bothBlockBottom;
		newBlockRight.left = blockOneRight;
		newBlockRight.right = blockOneRight + newBlockWidth;
		newBlockRight.color = this.state.blocks[i].color;
		
		// get blocks, put left split block in i's place, and append right split block to end of blocks
		let tempBlocks = [];
		Object.assign(tempBlocks, this.state.blocks);
		Object.assign(tempBlocks[i], newBlockLeft);
		tempBlocks.push(newBlockRight);
		this.setState({blocks: tempBlocks});
	}
	
	colorBlock(i){
		// add current state to undoQueue
		let undoQueue = JSON.parse(JSON.stringify(this.state.undoBlocks));
		let tempBlock = JSON.parse(JSON.stringify(this.state.blocks));
		undoQueue.push(tempBlock);
		this.setState({undoBlocks: undoQueue});
		
		// duplicate block i, color it and then put it back in block i's place
		let colorBlock = this.state.blocks[i];
		colorBlock.color = document.getElementById("colorpicker").value;
		let tempBlocks = [];
		Object.assign(tempBlocks, this.state.blocks);
		Object.assign(tempBlocks[i], colorBlock);
		this.setState({blocks: tempBlocks});
		
		// if current color is not in palette, add it to palette automatically
		this.addToPalette(colorBlock.color);
	}
	
	undo(){
		// set current state to last block state on undoQueue, remove it and update undoQueue
		let undoQueue = JSON.parse(JSON.stringify(this.state.undoBlocks));
		let previousBlocks = undoQueue.pop();
		this.setState({blocks: previousBlocks});
		this.setState({undoBlocks: undoQueue});
	}
	
	clear() {
		let clearBlock = Object.create(block);
		clearBlock.top = 0;
		clearBlock.left = 0;
		clearBlock.bottom = 100;
		clearBlock.right = 100;
		this.setState({blocks: [clearBlock]});
		this.setState({undoBlocks: []});
		this.setState({popup: "none"});
	}
	
	handleBlockClick(i) {
		// call function for selected tool on the block by key
		if (this.state.toolSelected === "split"){
			if (this.state.splitDir === "H"){
				this.splitBlockHoriz(i);
			}
			else {
				this.splitBlockVert(i);
			}
		}
		else if (this.state.toolSelected === "color"){
			this.colorBlock(i);
		}
	}
	
	swapSplitDir(){
		// swap H/V in state
		if (this.state.splitDir === "H"){
			this.setState({splitDir: "V"});
		}
		else {
			this.setState({splitDir: "H"});
		}
	}
	
	swapLineDisplay(){
		// set the lines state to the opposite of the current break
		this.setState({lines: !this.state.lines});
		// then replace current state with identical state with lines on opposite display setting
		let tempBlocks = this.state.blocks;
		for(let i = 0; i < this.state.blocks.length; i++){
			tempBlocks[i].lines = !this.state.lines;
		}
		this.setState({blocks: tempBlocks});
	}

	setTool(tool){
		// helper function to set tool easier
		this.setState({toolSelected: tool});
	}
	
	renderLineButton(){
		if (this.state.lines){
			return(<div id="sidebutton" className="activebutton selectedoption" onClick={()=>this.swapLineDisplay()}>on</div>)
		}
		else {
			return(<div id="sidebutton" className="inactivebutton" onClick={()=>this.swapLineDisplay()}>off</div>)
		}
	}
	
	renderSplitButton(){
		if (this.state.toolSelected === "split"){
			if (this.state.splitDir === "H"){
				return(<div id="sidebutton" className="activebutton" onClick={()=>this.swapSplitDir()}><span className="selectedoption">H</span>  V</div>)
			}
			else {
				return(<div id="sidebutton" className="activebutton" onClick={()=>this.swapSplitDir()}>H  <span className="selectedoption">V</span></div>)
			}
		}
		else {
			return(<div id="sidebutton" className="inactivebutton" onClick={()=>this.setTool("split")}>H  V</div>)
		}
	}

	renderColorButton(){
		if (this.state.toolSelected === "color"){
			return(<div id="sidebutton" className="activebutton selectedoption">color</div>)
		} else {
			return(<div id="sidebutton" className="inactivebutton" onClick={()=>this.setTool("color")}>color</div>)
		}
	}

	renderUndoButton(){
		if (this.state.undoBlocks.length > 0){
			return(<div id="sidebutton" className="activebutton" onClick={()=>this.undo()}><span className="selectedoption">undo</span></div>)
		} else {
			return(<div id="sidebutton" className="inactivebutton">undo</div>)
		}
	}

	renderClearButton(){
		if (this.state.blocks.length > 1){
			return(<div id="sidebutton" className="activebutton" onClick={()=>this.setState({popup: "clear"})}><span className="selectedoption">clear</span></div>)
		} else {
			return(<div id="sidebutton" className="inactivebutton">clear</div>)
		}
	}
	
	renderSaveButton(){
		return(<div id="sidebutton" className="activebutton" onClick={()=>this.setState({popup: "save/load"})}><span className="selectedoption">menu</span></div>)
	}
	
	renderPopUp(){
		if (this.state.popup === "none"){
		}
		else if (this.state.popup === "clear"){
			return(
			<>
				<div id="bgcover">
				</div>
				<div className="popup" id="popupclear">
					<strong>Clear?</strong>
					Are you sure you want to clear the canvas?
					<em>(You will not be able to undo this.)</em><br/>
					<div id="popupbuttonholder">
						<div className="popupbutton" onClick={()=>this.clear()}>Yes</div>
						<div className="popupbutton" onClick={()=>this.setState({popup:"none"})}>No</div>
					</div>
				</div>
			</>
			)
		}
		else if (this.state.popup === "save/load"){
			var saveState = JSON.stringify(this.state.blocks)
			return(
			<>
				<div id="bgcover">
				</div>
				<div className="popup" id="popupsave">
					<strong>Save/Load</strong>
					To save your image, copy the text in the box and save it somewhere. To load an image, paste the text for a saved image in the text box and press OK.
					<em>(Saving or loading an image does not preserve the undo history.)</em>
					<br/>
					<div className="center">
						<input type="text" id="saveloadfield" defaultValue={saveState}/> 
						{/* need to add some sort of js event to select entire input on click */}
					</div>
					<br/>
					<div id="popupbuttonholder">
						<div className="popupbutton" onClick={()=>console.log("poo")}>OK</div>
					</div>
				</div>
			</>
			)
		}
	}

	setPopUp(state){
		this.setState({popup:state})
	}

/*
	setBlockState(inState){
		let newState
		try {
			newState = JSON.parse(inState)
		} catch(error) {
			return false
		}
		this.setState({blocks:newState})
		return true
	}*/
	
	saveBlockStateToString(){
		let tempJSON = JSON.parse(JSON.stringify(this.state.blocks))
		let csvOut = ""
		for (let i = 0; i < tempJSON.length; i++){
			csvOut += tempJSON[i]['top'] + ","
			csvOut += tempJSON[i]['bottom'] + ","
			csvOut += tempJSON[i]['left'] + ","
			csvOut += tempJSON[i]['right'] + ","
			if (tempJSON[i]['color'] === undefined) {
				csvOut += "#FFFFFF!"
			}
			else {
				csvOut += tempJSON[i]['color'] + "!"
			}
		}
		// csvOut looks like this: top,bottom,left,right,color!<repeat>
		// for example: 0,50,0,50,#000000!<repeat>
		return(csvOut)
	}
	
	loadBlockStateFromString(saveString){
		// takes in string from saveBlockStateToString and returns them in block object form
		let blocksObject = []
		try{
			let boxStringArray = saveString.split('!')
			for (let i = 0; i < boxStringArray.length - 1; i++){
				let currBoxString = boxStringArray[i].split(',')
				let currBlock = {}
				currBlock.top = parseInt(currBoxString[0])
				currBlock.bottom = parseInt(currBoxString[1])
				currBlock.left = parseInt(currBoxString[2])
				currBlock.right = parseInt(currBoxString[3])
				currBlock.color = currBoxString[4]
				blocksObject.push(currBlock)
			}
		} catch(error) {
			return false
		}
		// don't set the state unless we created a non-empty list of blocks with proper keys
		let isGood = true
		for (let i = 0; i < blocksObject.length; i++){
			if (!blocksObject[i].hasOwnProperty('top')) isGood = false
			if (!blocksObject[i].hasOwnProperty('bottom')) isGood = false
			if (!blocksObject[i].hasOwnProperty('left')) isGood = false
			if (!blocksObject[i].hasOwnProperty('right')) isGood = false
			if (!blocksObject[i].hasOwnProperty('color')) isGood = false
		}
		if (isGood && blocksObject.length > 0) this.setState({blocks:blocksObject})
		return isGood
	}

	colorChange(){
		if (this.state.toolSelected !== "color"){
			this.setTool("color")
		}
	}

	addToPalette(){
		// create a copy of palette to work with
		let tempPalette = [];
		Object.assign(tempPalette, this.state.palette)
		// if the current selected color is in the palette, don't add it
		for (let i = 0; i < tempPalette.length; i++){
			if (tempPalette[i] === document.getElementById("colorpicker").value) return;
		}
		// if the current selected color is new, add it to palette
		tempPalette.push(document.getElementById("colorpicker").value);
		this.setState({palette: tempPalette});
	}
	
	handleColorClick(i){
		document.getElementById("colorpicker").value = this.state.palette[i];
	}

	render() {		
		return (
		<div>
			<div>
				<div id="main">
					<div id="left">
					<Board 
						blocks={this.state.blocks}
						onClick={(i)=>this.handleBlockClick(i)}
					/>
					</div>
					<div id="right">
						split dir
						{this.renderSplitButton()}
						<br/>
						color
						{this.renderColorButton()}
						<br/>
						<input type="color" id="colorpicker" defaultValue="#000000" onChange={()=>this.colorChange()}/>
						<br/>
						palette
						<Palette
							palette={this.state.palette}
							onClick={(i)=>this.handleColorClick(i)}
							addToPalette={()=>this.addToPalette()} // pass this function on down to '+' palette Block
						/>
						<br/>
						lines
						{this.renderLineButton()}
						<br/>
						undo
						{this.renderUndoButton()}
						<br/>
						clear
						{this.renderClearButton()}
						<br/>
						save/load
						{this.renderSaveButton()}
						<br/>
					</div>
				</div>
			</div>
			<PopUp
				popupState={this.state.popup}
				clearFunc={()=>this.clear()}
				setPopUpState={(inState)=>this.setPopUp(inState)}
				blockStateToString={()=>this.saveBlockStateToString()}
				stringToBlockState={(inString)=>this.loadBlockStateFromString(inString)}
			/>
		</div>
		);
	}
}

// ========================================

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
