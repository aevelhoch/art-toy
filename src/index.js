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
	
	let cName = "littleBox";
	if(props.stats.lines === false) cName += "Off";
	
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

/*
class Palette extends React.Component {
	return();
}
*/

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
		splitDir: "H",
		toolSelected: "split",
		lines: true
		};
	}
	
	splitBlockHoriz(i){
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
	}
	
	undo(){
		// set current state to last block state on undoQueue, remove it and update undoQueue
		let undoQueue = JSON.parse(JSON.stringify(this.state.undoBlocks));
		let previousBlocks = undoQueue.pop();
		this.setState({blocks: previousBlocks});
		this.setState({undoBlocks: undoQueue});
	}
	
	handleClick(i) {
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
		if (this.state.splitDir === "H"){
			this.setState({splitDir: "V"});
		}
		else {
			this.setState({splitDir: "H"});
		}
	}
	
	swapLineDisplay(){
		if (this.state.lines){
			this.setState({lines: false});
			let tempBlocks = this.state.blocks;
			for(let i = 0; i < this.state.blocks.length; i++){
				tempBlocks[i].lines = false;
			}
			this.setState({blocks: tempBlocks});
		}
		else {
			this.setState({lines: true})
			let tempBlocks = this.state.blocks;
			for(let i = 0; i < this.state.blocks.length; i++){
				tempBlocks[i].lines = true;
			}
			this.setState({blocks: tempBlocks});
		}
	}

	setTool(tool){
		this.setState({toolSelected: tool});
	}
	
	renderLineButton(){
		if (this.state.lines){
			return(<div id="sidebutton" className="activebutton" onClick={()=>this.swapLineDisplay()}><span className="selectedoption">O</span>  X</div>)
		}
		else {
			return(<div id="sidebutton" className="activebutton" onClick={()=>this.swapLineDisplay()}>O  <span className="selectedoption">X</span></div>)
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
			return(<div id="sidebutton" className="activebutton"><span className="selectedoption">color</span></div>)
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

	render() {		
		return (
			<div>
				<div id="center">
					<div id="left">
					<Board 
						blocks={this.state.blocks}
						onClick={(i)=>this.handleClick(i)}
					/>
					</div>
					<div id="right">
						split dir
						{this.renderSplitButton()}
						<br/>
						color
						{this.renderColorButton()}
						<br/>
						<input type="color" id="colorpicker" defaultValue="#000000"/>
						<br/>
						<br/>
						lines
						{this.renderLineButton()}
						<br/>
						undo
						{this.renderUndoButton()}
						<br/>
					</div>
				</div>
			</div>
		);
	}
}

// ========================================

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
