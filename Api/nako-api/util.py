from datetime import datetime


def return_timestamp():
    return str(datetime.now())


def list2str(lst):
    str0 = " "
    return str0.join(str(lst))
