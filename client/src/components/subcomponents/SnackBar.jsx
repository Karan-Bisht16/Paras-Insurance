import { Alert, Snackbar } from "@mui/material";

const SnackBar = (props) => {
    const { openSnackbar, timeOut, handleClose, type, message, sx, vertical, horizontal } = props;

    return (
        <div>
            {(vertical && horizontal) ?
                <Snackbar open={openSnackbar} autoHideDuration={timeOut} onClose={handleClose} anchorOrigin={{ vertical, horizontal }} sx={sx}>
                    <Alert
                        onClose={handleClose} severity={type} variant="filled"
                        sx={{ width: "100%", position: "absolute", top: "78px" }}
                    >
                        {message}
                    </Alert>
                </Snackbar>
                :
                <Snackbar open={openSnackbar} autoHideDuration={timeOut} onClose={handleClose} sx={sx}>
                    <Alert
                        onClose={handleClose} severity={type} variant="filled"
                        sx={{ width: "100%" }}
                    >
                        {message}
                    </Alert>
                </Snackbar>
            }
        </div>
    );
}

export default SnackBar;