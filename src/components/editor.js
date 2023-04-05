import React, {useRef, useEffect, useState} from "react";
import { Data } from '../game/data';
import { Main } from '../game/main';
import { TitleBar } from './title-bar';
import { TileExplorer } from './tile-explorer';
import { NewDialog } from "./new-dialog";
import { HelpDialog } from "./help-dialog";

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

export function Editor() {
    const canvasRef = useRef();
    const inputFile = useRef();
    const [data, setData] = useState(undefined);
    const [main, setMain] = useState(undefined);
    const [editMode, setEditMode] = useState('none');
    const [newDialogOpen, setNewDialogOpen] = useState(false);
    const [helpDialogOpen, setHelpDialogOpen] = useState(false);
    let mainCreated = false;

    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        if (!mainCreated) {
            let newData = new Data();
            newData.load();
            let newMain = new Main(ctx, newData);
            newMain.start();
            setData(newData);
            setMain(newMain);
            mainCreated = true;
        }
    }, []);

    function handleDeletionMode(type) {
        let setTo = `delete-${type}`;
        if (editMode !== setTo) {
            setEditMode(setTo);
        }
    }

    function handlePassingMode(mode) {
        if (editMode !== mode) {
            setEditMode(mode);
        }
    }

    function handleTileSelection(tileName) {
        let setTo = `tile-${tileName}`;
        if (editMode !== setTo) {
            setEditMode(setTo);
        }
    }

    function handleObjectSelection(objectName) {
        let setTo = `object-${objectName}`;
        if (editMode !== setTo) {
            setEditMode(setTo);
        }
    }

    function handleHelp() {
        setHelpDialogOpen(true);
    }

    function handleCloseHelp() {
        setHelpDialogOpen(false);
    }

    function handleNew() {
        setNewDialogOpen(true);
    }

    function handleCloseNewDialog() {
        setNewDialogOpen(false);
    }

    function handleCreateNewMap(width, height) {
        main?.createNewLevel(width, height);
        setNewDialogOpen(false);
    }

    function handleLoad() {
        inputFile.current.click();
    }

    function handleInputFileChanged(file) {
        let reader = new FileReader();
        reader.onload = function(event) {
            main?.destringifyAndLoadLevel(event.target.result);
        }
        reader.readAsText(file);
    }
    
    function handleSave() {
        //make copy of level and add in animation names instead of image data
        if (main) {
            download(main.stringifyLevel(), "level.json", 'text/plain');
        }
    }

    return (
        <div tabIndex="0"
            onKeyDown={(event) => {
                main?.handleKeyDown(event.key);
            }}
            onKeyUp={() => {
                main?.handleKeyUp();
            }}
        >
            <TitleBar handleDeletionMode={handleDeletionMode} handlePassingMode={handlePassingMode} handleNew={handleNew} handleLoad={handleLoad} handleSave={handleSave} handleHelp={handleHelp} editMode={editMode}/>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <canvas style={{minWidth: '82%', maxHeight: '92vh', border:'2px', borderColor:'white'}}
                    
                    id='scene' ref={canvasRef}
                    width='640' height='400'
                    onWheel={(event) => {
                        main?.handleMouseWheel(event.deltaY);
                    }}
                    onMouseMove={(event) => {
                        let rect = canvasRef.current.getBoundingClientRect();
                        let x = event.clientX - rect.left;
                        let y = event.clientY - rect.top;
                        main?.handleMouseMove(
                            x / canvasRef.current.clientWidth * canvasRef.current.width, 
                            y / canvasRef.current.clientHeight * canvasRef.current.height, 
                            editMode);
                    }}
                    onMouseDown={(event) => {
                        if (event.button === 0) {
                            main?.handleMouseDown(editMode);
                        } 
                    }}
                    onMouseUp={(event) => {
                        if (event.button === 0) {
                            main?.handleMouseUp();
                        } else if (event.button === 1) {
                            main?.handleMouseClick()
                        }
                    }}
                ></canvas> 
                <TileExplorer data={data} handleTileSelection={handleTileSelection} handleObjectSelection={handleObjectSelection} editMode={editMode}/>
                <NewDialog open={newDialogOpen} handleCloseNewDialog={handleCloseNewDialog} handleCreateNewMap={handleCreateNewMap}/>
                <HelpDialog open={helpDialogOpen} handleCloseHelp={handleCloseHelp}/>
            </div>
            <input type='file' id='file' ref={inputFile} style={{display: 'none'}} onChange={(event) => handleInputFileChanged(event.target.files[0])}/>
        </div>
    )
}